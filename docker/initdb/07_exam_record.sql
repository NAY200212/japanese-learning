-- JLPT 模拟考试计分体系（P2）
-- 1) exam_record：一次考试的成绩单（180 分制，分项统计）
CREATE TABLE IF NOT EXISTS exam_record (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL,
    level          VARCHAR(10) NOT NULL COMMENT 'N5/N4/N3',
    total_score    INT NOT NULL DEFAULT 0 COMMENT '总分(0~180)',
    vocab_score    INT NOT NULL DEFAULT 0 COMMENT '文字語彙(0~60)',
    grammar_score  INT NOT NULL DEFAULT 0 COMMENT '文法(0~60)',
    reading_score  INT NOT NULL DEFAULT 0 COMMENT '読解(0~60)',
    correct_count  INT NOT NULL DEFAULT 0 COMMENT '答对题数',
    total_count    INT NOT NULL DEFAULT 0 COMMENT '总题数',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_level (user_id, level),
    CONSTRAINT fk_exam_record_user FOREIGN KEY (user_id) REFERENCES user (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '模拟考试成绩单';

-- 2) exam_answer：单题答题明细（与成绩单同事务写入）
CREATE TABLE IF NOT EXISTS exam_answer (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    record_id   INT NOT NULL,
    question_id INT NOT NULL,
    option_id   INT NULL COMMENT '用户选的选项ID',
    is_correct  TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=对 0=错',
    KEY idx_record (record_id),
    CONSTRAINT fk_exam_answer_record FOREIGN KEY (record_id) REFERENCES exam_record (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '考试答题明细';
