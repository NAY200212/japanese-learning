package com.japaneselearning.service.impl;

import com.japaneselearning.entity.Question;
import com.japaneselearning.entity.QuestionOption;
import com.japaneselearning.entity.Word;
import com.japaneselearning.exception.BusinessException;
import com.japaneselearning.service.AiService;
import com.japaneselearning.service.QuestionService;
import com.japaneselearning.service.WordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI 助手实现：调用 DeepSeek（经 Spring AI OpenAiChatModel 自动配置），
 * 相同请求文本结果写 Redis（短 TTL），调用失败抛业务异常由全局异常处理器转友好文案。
 */
@Slf4j
@Service
public class AiServiceImpl implements AiService {

    /** AI 结果短缓存：10 分钟，避免相同问题重复计费 */
    private static final Duration AI_CACHE_TTL = Duration.ofMinutes(10);

    private static final String FRIENDLY_ERR = "AI 服务暂时不可用，请稍后重试";

    @Autowired
    private ChatModel chatModel;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private WordService wordService;

    @Override
    public String analyzeWrongQuestion(Map<String, Object> req) {
        Integer questionId = toInteger(req.get("questionId"));
        String content = str(req.get("content"));
        String userAnswer = str(req.get("userAnswer"));
        String correctAnswer = str(req.get("correctAnswer"));
        @SuppressWarnings("unchecked")
        List<String> options = (List<String>) req.get("options");

        if (questionId == null && !StringUtils.hasText(content)) {
            throw new BusinessException("请提供题干内容，或传入题目 id（questionId）");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("你是一名经验丰富的日语教师。请解析一道日语题，帮助学习者理解错因。输出按以下小节（每节标题独占一行、正文换行书写）：\n")
          .append("【题目还原】\n")
          .append("【正确答案】\n")
          .append("【日文解析】用日语解释考点，难度贴合题目等级\n")
          .append("【中文讲解】用中文讲清解题思路与知识点\n")
          .append("【错因分析】针对用户所选答案分析错在哪里\n")
          .append("【学习建议】给出可执行的复习建议\n\n");

        if (questionId != null) {
            Question q = questionService.findDetail(questionId);
            if (q == null) {
                throw new BusinessException("题目不存在（id=" + questionId + "）");
            }
            sb.append("题目等级：").append(q.getLevel() == null ? "未知" : q.getLevel())
              .append("；题型：").append(q.getType() == null ? "未知" : q.getType()).append("\n");
            sb.append("题干：").append(q.getContent()).append("\n");
            if (q.getOptions() != null && !q.getOptions().isEmpty()) {
                sb.append("选项：\n");
                int idx = 0;
                for (QuestionOption opt : q.getOptions()) {
                    sb.append("  ").append((char) ('A' + idx)).append(". ").append(opt.getContent()).append("\n");
                    idx++;
                }
                String correct = q.getOptions().stream()
                        .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                        .map(QuestionOption::getContent)
                        .collect(Collectors.joining("、"));
                if (StringUtils.hasText(correct)) {
                    sb.append("正确答案：").append(correct).append("\n");
                }
            }
            if (StringUtils.hasText(userAnswer)) {
                sb.append("用户所选答案：").append(userAnswer).append("\n");
            }
        } else {
            sb.append("题干：\n").append(content).append("\n");
            if (options != null && !options.isEmpty()) {
                sb.append("选项：\n");
                options.forEach(o -> sb.append("  - ").append(o).append("\n"));
            }
            if (StringUtils.hasText(correctAnswer)) {
                sb.append("正确答案：").append(correctAnswer).append("\n");
            }
            if (StringUtils.hasText(userAnswer)) {
                sb.append("用户所选答案：").append(userAnswer).append("\n");
            }
        }
        if (!StringUtils.hasText(userAnswer)) {
            sb.append("（本题未提供用户所选答案，可略过错因分析，重点讲清考点与正确答案。）\n");
        }
        return cachedOrCall("wrong", sb.toString());
    }

    @Override
    public String wordExamples(Map<String, Object> req) {
        String word = str(req.get("word"));
        Integer wordId = toInteger(req.get("wordId"));
        if (wordId == null && !StringUtils.hasText(word)) {
            throw new BusinessException("请输入要查询的日语单词");
        }
        StringBuilder sb = new StringBuilder();
        sb.append("你是一名日语老师。请为下面这个日语单词生成 2-3 个地道、常用、难度适合学习者水平的例句。输出按以下小节（每节标题独占一行）：\n")
          .append("【单词信息】列出：写法、假名读音、词性、中文释义（若给定词库资料请以词库为准；未给出按常见用法补充）\n")
          .append("【例句】每条占一行，格式：日文原句（汉字后括号标注假名读音，只标难读词即可）+ 中文翻译\n")
          .append("【用法说明】说明常见搭配、使用场景与注意点\n\n");

        if (wordId != null) {
            Word w = wordService.findById(wordId);
            if (w != null) {
                sb.append("词库资料：写法=").append(nullTo(w.getWord()))
                  .append("；假名=").append(nullTo(w.getKana()))
                  .append("；词性=").append(nullTo(w.getPartOfSpeech()))
                  .append("；释义=").append(nullTo(w.getMeaning()))
                  .append("；级别=").append(nullTo(w.getLevel())).append("\n");
            }
        }
        sb.append("要学习的单词：").append(StringUtils.hasText(word) ? word : "（使用上面词库资料中的单词）").append("\n");
        return cachedOrCall("word", sb.toString());
    }

    @Override
    public String askGrammar(Map<String, Object> req) {
        String question = str(req.get("question"));
        if (!StringUtils.hasText(question)) {
            throw new BusinessException("请输入你想问的日语语法或句型");
        }
        StringBuilder sb = new StringBuilder();
        sb.append("你是一名日语语法专家。请用中文回答下面的日语语法/句型问题。输出按以下小节（每节标题独占一行）：\n")
          .append("【语法点】说明含义、接续方式、使用场景\n")
          .append("【例句】给出 2-3 个例句，每条格式：日文原句 + 中文翻译\n")
          .append("【辨析与注意】若该语法有易混表达请对比辨析；没有则列出学习者常见误区\n\n")
          .append("问题：").append(question).append("\n");
        return cachedOrCall("grammar", sb.toString());
    }

    // ===== 内部工具 =====

    /** 带缓存的 DeepSeek 调用：缓存未命中才真实调用模型；Redis 异常自动降级为直连 */
    private String cachedOrCall(String type, String prompt) {
        String key = "ai:" + type + ":" + DigestUtils.md5DigestAsHex(prompt.getBytes(StandardCharsets.UTF_8)).substring(0, 16);
        try {
            String cached = stringRedisTemplate.opsForValue().get(key);
            if (cached != null) {
                return cached;
            }
        } catch (Exception e) {
            log.warn("AI 缓存读取失败，降级直连 DeepSeek: {}", e.getMessage());
        }

        String answer = callDeepSeek(prompt);

        try {
            stringRedisTemplate.opsForValue().set(key, answer, AI_CACHE_TTL);
        } catch (Exception e) {
            log.warn("AI 缓存写入失败: {}", e.getMessage());
        }
        return answer;
    }

    private String callDeepSeek(String prompt) {
        try {
            String resp = chatModel.call(prompt);
            if (!StringUtils.hasText(resp)) {
                throw new BusinessException("AI 未返回有效内容，请重试");
            }
            return resp.trim();
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            log.error("DeepSeek 调用失败", e);
            throw new BusinessException(FRIENDLY_ERR);
        }
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o).trim();
    }

    private static Integer toInteger(Object o) {
        if (o == null) {
            return null;
        }
        if (o instanceof Number n) {
            return n.intValue();
        }
        try {
            return Integer.valueOf(String.valueOf(o).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String nullTo(String s) {
        return StringUtils.hasText(s) ? s : "（无）";
    }
}
