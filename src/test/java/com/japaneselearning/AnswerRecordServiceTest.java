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

    // シナリオ1：誤答 + 誤答ノートにこの問題が無い → 解答記録の挿入と誤答ノートへの新規追加が行われる
    @Test
    void testSubmit_wrong_newQuestion() {
        // 準備：誤答ノートの検索が null を返す（この問題は無い）
        when(wrongBookMapper.findByUserAndQuestion(1,5)).thenReturn(null);

        // 実行
        answerRecordService.submit(1, 5, false, "practice");

        // アサート
        verify(answerRecordMapper).insert(any(AnswerRecord.class));      // 解答記録は必ず挿入される
        verify(wrongBookMapper).insert(1,5);                            // 誤答ノートに新規追加される
        verify(wrongBookMapper, never()).increaseWrong(anyInt());          // 絶対に +1 されない
    }

    // シナリオ2：誤答 + 誤答ノートに既にこの問題がある → 解答記録の挿入と誤答回数+1が行われる
    @Test
    void testSubmit_wrong_existing() {
        // 準備：誤答ノートの検索が既存レコード（id=10）を返す
        WrongBook wb = new WrongBook();
        wb.setId(10);
        when(wrongBookMapper.findByUserAndQuestion(1, 5)).thenReturn(wb);

        // 実行
        answerRecordService.submit(1, 5, false, "practice");

        // アサート
        verify(answerRecordMapper).insert(any(AnswerRecord.class));
        verify(wrongBookMapper).increaseWrong(10);                        // id=10 のレコードを +1
        verify(wrongBookMapper, never()).insert(anyInt(), anyInt());      // 絶対に新規追加しない
    }
}
