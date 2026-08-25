package com.japaneselearning.service;

import com.japaneselearning.entity.WrongBook;
import java.util.List;

public interface WrongBookService {
    List<WrongBook> listByUser(Integer userId);
    void markMastered(Integer userId, Integer questionId);
}
