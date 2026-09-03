package com.japaneselearning.service;

import java.util.Map;

/**
 * AI 助手服务：基于 DeepSeek（Spring AI OpenAI 兼容协议）的三种能力。
 * 统一入参用 Map，字段语义见 AiController 的 Swagger 注释。
 */
public interface AiService {

    /**
     * 错题解析：questionId 存在时后端按题号取题（题干/选项/正确答案），否则用请求中
     * content(+options) + userAnswer + correctAnswer 拼题面。
     * @return DeepSeek 生成的解析文本（含日文解析/中文讲解/错因分析）
     */
    String analyzeWrongQuestion(Map<String, Object> req);

    /**
     * 单词例句：word 必填（日语写法），wordId 可附带词库释义/级别上下文。
     * @return 2-3 个地道例句（含假名注音 + 中文翻译）
     */
    String wordExamples(Map<String, Object> req);

    /**
     * 语法问答：question 为任意日语语法/句型提问。
     * @return 讲解 + 例句 + 辨析
     */
    String askGrammar(Map<String, Object> req);
}
