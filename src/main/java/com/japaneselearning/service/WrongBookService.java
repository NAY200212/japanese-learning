package com.japaneselearning.service;

import com.japaneselearning.common.PageResult;
import com.japaneselearning.entity.WrongBook;
import java.util.List;

public interface WrongBookService {
    List<WrongBook> listByUser(Integer userId);
    PageResult<WrongBook> pageByUser(Integer userId, int page, int size);
    void markMastered(Integer userId, Integer questionId);
}
