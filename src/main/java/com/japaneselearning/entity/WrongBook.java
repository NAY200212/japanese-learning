package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WrongBook {
    private Integer id;           // 主键
    private Integer userId;       // 用户ID
    private Integer questionId;   // 题目ID
    private Integer wrongCount;   // 累计错题次数
    private Integer rightCount;   // 累计答对次数
    private String status;        // 待复习/已掌握
    private LocalDateTime lastWrongAt; // 最近出错时间
    // 以下 3 个字段来自 JOIN question 表，仅查询展示用
    private String questionContent;
    private String questionType;
    private String questionLevel;

}
