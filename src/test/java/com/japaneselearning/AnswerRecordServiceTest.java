package com.japaneselearning;

import com.japaneselearning.entity.AnswerRecord;
import com.japaneselearning.entity.WrongBook;
import com.japaneselearning.mapper.AnswerRecordMapper;
import com.japaneselearning.mapper.WrongBookMapper;
import com.japaneselearning.service.impl.AnswerRecordServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@SpringBootTest
public class AnswerRecordServiceTest {

    @Autowired
    private AnswerRecordServiceImpl answerRecordService;

    @MockBean
    private AnswerRecordMapper answerRecordMapper;

    @MockBean
    private WrongBookMapper wrongBookMapper;

    // 场景1：答错 + 错题本没有这题 → 应插入答题记录 + 往错题本新增
    @Test
    void testSubmit_wrong_newQuestion() {
        // 剧本：查错题本返回 null（没有这题）
        when(wrongBookMapper.findByUserAndQuestion(1,5)).thenReturn(null);

        // 执行
        answerRecordService.submit(1, 5, false, "practice");

        // 断言
        verify(answerRecordMapper).insert(any(AnswerRecord.class));      // 答题记录必插
        verify(wrongBookMapper).insert(1,5);                            // 错题本新增
        verify(wrongBookMapper, never()).increaseWrong(anyInt());          // 绝不+1
    }

    // 场景2：答错 + 错题本已有这题 → 应插入答题记录 + 错次数+1
    @Test
    void testSubmit_wrong_existing() {
        // 剧本：查错题本返回一条已存在的记录（id=10）
        WrongBook wb = new WrongBook();
        wb.setId(10);
        when(wrongBookMapper.findByUserAndQuestion(1, 5)).thenReturn(wb);

        // 执行
        answerRecordService.submit(1, 5, false, "practice");

        // 断言
        verify(answerRecordMapper).insert(any(AnswerRecord.class));
        verify(wrongBookMapper).increaseWrong(10);                        // 给 id=10 这条+1
        verify(wrongBookMapper, never()).insert(anyInt(), anyInt());      // 绝不新增
    }
}
