package com.japaneselearning;

import com.japaneselearning.entity.WrongBook;
import com.japaneselearning.mapper.WrongBookMapper;
import com.japaneselearning.service.impl.WrongBookServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class WrongBookServiceTest {

    @Autowired
    private WrongBookServiceImpl wrongBookService;

    @MockBean
    private WrongBookMapper wrongBookMapper;

    @Test
    void testListByUser() {
        // 1. 準備：誤答データを 2 件作成
        WrongBook wb1 = new WrongBook();
        wb1.setId(1);
        wb1.setQuestionId(5);
        WrongBook wb2 = new WrongBook();
        wb2.setId(2);
        wb2.setQuestionId(8);

        // 2. mock：mapper.listByUserPage(1, 0, MAX) が呼ばれたらこの 2 件を返す
        when(wrongBookMapper.listByUserPage(1, 0, Integer.MAX_VALUE)).thenReturn(Arrays.asList(wb1, wb2));

        // 3. 実行
        List<WrongBook> list = wrongBookService.listByUser(1);

        // 4. アサート：件数 2、先頭の questionId は 5
        assertEquals(2, list.size());
        assertEquals(5, list.get(0).getQuestionId());
        // 5. mapper がちょうど 1 回呼ばれたことを検証
        verify(wrongBookMapper, times(1)).listByUserPage(1, 0, Integer.MAX_VALUE);
    }


    @Test
    void testMarkMastered() {
        wrongBookService.markMastered(1, 5);
        verify(wrongBookMapper).markMastered(1, 5);

        // markMastered 呼び出し後に mapper.markMastered(1, 5) が実行されることを検証
    }
}
