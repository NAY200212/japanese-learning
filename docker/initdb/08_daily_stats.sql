-- 每日学习统计表（P3 定时任务产出）
CREATE TABLE IF NOT EXISTS daily_stats (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT          NOT NULL COMMENT '用户ID',
  stat_date     DATE         NOT NULL COMMENT '统计日期',
  word_count    INT          NOT NULL DEFAULT 0 COMMENT '当日背词数',
  exam_count    INT          NOT NULL DEFAULT 0 COMMENT '当日考试次数',
  wrong_count   INT          NOT NULL DEFAULT 0 COMMENT '当日错题数',
  checkin_count INT          NOT NULL DEFAULT 0 COMMENT '当日打卡次数',
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_user_date (user_id, stat_date)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='每日学习统计';
