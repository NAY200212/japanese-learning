-- ============================================
-- 日本語学習プラットフォーム - 建表スクリプト（word/question/...）
-- 対象DB: japanese_learning（MySQL 3307）
-- 備考: user テーブルは作成済み。本スクリプトは残り 8 つの業務テーブルを作成する
-- ============================================

USE japanese_learning;

-- 0. ユーザーテーブル（冪等、既存ならスキップ）
CREATE TABLE IF NOT EXISTS user (
    id         INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    username   VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户名',
    password   VARCHAR(100) NOT NULL COMMENT '密码(BCrypt加密后)',
    email      VARCHAR(100) NULL COMMENT '邮箱',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间'
) COMMENT '用户表';

-- 1. 単語テーブル
CREATE TABLE IF NOT EXISTS word (
    id             INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    word           VARCHAR(100)  NOT NULL COMMENT '日语写法(汉字+假名)',
    kana           VARCHAR(100)  NOT NULL COMMENT '读音(假名)',
    meaning        VARCHAR(200)  NOT NULL COMMENT '中文释义',
    part_of_speech VARCHAR(50)   NULL COMMENT '词性',
    level          VARCHAR(10)   NOT NULL COMMENT '等级 N5~N1',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '单词表';

-- 2. 問題テーブル
CREATE TABLE IF NOT EXISTS question (
    id         INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    level      VARCHAR(10) NOT NULL COMMENT '等级 N1~N5',
    type       VARCHAR(20) NOT NULL COMMENT '题型: 文字・語彙/読解/聴解',
    content    TEXT        NOT NULL COMMENT '题干',
    analysis   TEXT        NULL COMMENT '解析',
    audio_url  VARCHAR(255) NULL COMMENT '听力音频URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '题目表';

-- 3. 選択肢テーブル
CREATE TABLE IF NOT EXISTS question_option (
    id          INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    question_id INT          NOT NULL COMMENT '所属题目ID',
    content     VARCHAR(500) NOT NULL COMMENT '选项内容',
    is_correct  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否正确答案 1=是 0=否',
    CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES question(id)
) COMMENT '选项表';

-- 4. 解答記録テーブル
CREATE TABLE IF NOT EXISTS answer_record (
    id          INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    user_id     INT       NOT NULL COMMENT '用户ID',
    question_id INT       NOT NULL COMMENT '题目ID',
    is_correct  TINYINT(1) NOT NULL COMMENT '是否答对 1=对 0=错',
    mode        VARCHAR(20) NOT NULL COMMENT '模式: practice练习/exam模拟考试',
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '答题时间',
    CONSTRAINT fk_record_user FOREIGN KEY (user_id) REFERENCES user(id),
    CONSTRAINT fk_record_question FOREIGN KEY (question_id) REFERENCES question(id)
) COMMENT '答题记录表';

-- 5. 誤答ノートテーブル
CREATE TABLE IF NOT EXISTS wrong_book (
    id            INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    user_id       INT       NOT NULL COMMENT '用户ID',
    question_id   INT       NOT NULL COMMENT '题目ID',
    wrong_count   INT       NOT NULL DEFAULT 1 COMMENT '累计错题次数',
    right_count   INT       NOT NULL DEFAULT 0 COMMENT '累计答对次数',
    status        VARCHAR(20) NOT NULL DEFAULT '待复习' COMMENT '状态: 待复习/已掌握',
    last_wrong_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最近出错时间',
    CONSTRAINT fk_wrong_user FOREIGN KEY (user_id) REFERENCES user(id),
    CONSTRAINT fk_wrong_question FOREIGN KEY (question_id) REFERENCES question(id)
) COMMENT '错题本表';

-- 6. 単語記憶ステータステーブル
CREATE TABLE IF NOT EXISTS word_memory (
    id          INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    user_id     INT       NOT NULL COMMENT '用户ID',
    word_id     INT       NOT NULL COMMENT '单词ID',
    status      VARCHAR(20) NOT NULL DEFAULT '陌生' COMMENT '熟悉/模糊/陌生',
    reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '复习时间',
    CONSTRAINT fk_memory_user FOREIGN KEY (user_id) REFERENCES user(id),
    CONSTRAINT fk_memory_word FOREIGN KEY (word_id) REFERENCES word(id)
) COMMENT '单词记忆状态表';

-- 7. 学習進捗テーブル
CREATE TABLE IF NOT EXISTS study_progress (
    id          INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    user_id     INT       NOT NULL COMMENT '用户ID',
    target_type VARCHAR(20) NOT NULL COMMENT '目标类型: word/question',
    target_id   INT       NOT NULL COMMENT '目标ID',
    status      VARCHAR(20) NOT NULL DEFAULT '未完成' COMMENT '状态',
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES user(id)
) COMMENT '学习进度表';

-- 8. 毎日チェックインテーブル
CREATE TABLE IF NOT EXISTS daily_checkin (
    id           INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    user_id      INT  NOT NULL COMMENT '用户ID',
    checkin_date DATE NOT NULL COMMENT '打卡日期',
    tasks_done   INT  NOT NULL DEFAULT 0 COMMENT '完成任务数',
    words_done   INT  NOT NULL DEFAULT 0 COMMENT '背单词数',
    CONSTRAINT fk_checkin_user FOREIGN KEY (user_id) REFERENCES user(id),
    UNIQUE KEY uk_checkin (user_id, checkin_date)
) COMMENT '每日打卡表';
