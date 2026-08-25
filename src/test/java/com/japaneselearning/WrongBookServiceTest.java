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
        // 1. 准备：造 2 条错题数据
        WrongBook wb1 = new WrongBook();
        wb1.setId(1);
        wb1.setQuestionId(5);
        WrongBook wb2 = new WrongBook();
        wb2.setId(2);
        wb2.setQuestionId(8);

        // 2. mock：当 mapper.listByUser(1) 被调用时返回这 2 条
        when(wrongBookMapper.listByUser(1)).thenReturn(Arrays.asList(wb1, wb2));

        // 3. 执行
        List<WrongBook> list = wrongBookService.listByUser(1);

        // 4. 断言：数量 2、第一条 questionId 是 5
        assertEquals(2, list.size());
        assertEquals(5, list.get(0).getQuestionId());
        // 5. 验证 mapper 恰好被调用一次
        verify(wrongBookMapper, times(1)).listByUser(1);
    }


    @Test
    void testMarkMastered() {
        wrongBookService.markMastered(1, 5);
        verify(wrongBookMapper).markMastered(1, 5);

        // 验证 markMastered 调用后 mapper.markMastered(1, 5) 被执行
    }
}
