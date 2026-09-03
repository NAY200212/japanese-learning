---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: f8f5684a610de3d952eedcce4f3e4d6d_5aeb1ebfa53511f1903b525400f8a581
    ReservedCode1: o45CipBepiS7WIsrUkQuIKKr/qSHdVU4zA2qqGvK3r5gsTb44T1S1nicmKFFykbbIsjVM1IX9kNYGtHQSpy6yKAMHMkRPfMPflPahfo7AOyRUcxjNSiYX8YZY3IXZO60u7kwf/OvpM2PKgQHYBAko2yQPCSQJtIp0bMBtc31vZ82r2qX5wTUQXLJWkQ=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: f8f5684a610de3d952eedcce4f3e4d6d_5aeb1ebfa53511f1903b525400f8a581
    ReservedCode2: o45CipBepiS7WIsrUkQuIKKr/qSHdVU4zA2qqGvK3r5gsTb44T1S1nicmKFFykbbIsjVM1IX9kNYGtHQSpy6yKAMHMkRPfMPflPahfo7AOyRUcxjNSiYX8YZY3IXZO60u7kwf/OvpM2PKgQHYBAko2yQPCSQJtIp0bMBtc31vZ82r2qX5wTUQXLJWkQ=
---

# 技术栈知识点与面试要点笔记

> 本项目（日语学习平台）技术栈全解析 + 面试高频问题整理。
> 配合 README.md 使用，面向 Java 后端求职（日本 IT 正社员方向）。

---

## 一、后端框架层

### 1. Spring Boot 3.4.1（Java 17）

**作用**：后端地基，提供内嵌 Tomcat、自动化配置、依赖注入（DI/IoC）。

**核心原理**：
- `@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`
- 启动时扫描 `com.japaneselearning` 包，自动装配所有 Bean
- 项目 11 个 Controller、13 个 Mapper、Service 全部由 Spring 容器管理，无需手动 new —— 这就是控制反转（IoC）

**面试要点**：
- IoC（控制反转）/ DI（依赖注入）概念
- Spring Bean 生命周期：实例化 → 属性填充 → 初始化（@PostConstruct）→ 使用 → 销毁
- Bean 作用域：singleton（默认）/ prototype / request / session
- 自动配置原理：`META-INF/spring.factories` + `@ConditionalOnXxx`

### 2. MyBatis 3.0.4（持久层）

**作用**：Java 方法与 SQL 映射，替代手写 JDBC 样板代码。

**核心原理**：
- `@Mapper` 让 MyBatis 生成代理实现
- `#{}` 预编译：编译为 `?` 占位符再传参，**天然防 SQL 注入**
- `${}` 字符串拼接，有注入风险，禁止用于用户输入
- 动态 SQL：`<script><if>` + `WHERE 1=1` 拼接可选查询条件

**面试要点**：
- `#{}` 与 `${}` 区别（必考）
- MyBatis 一级缓存（SqlSession 级别）与二级缓存（namespace 级别）
- MyBatis 与 MyBatis-Plus、JPA 的区别与取舍

### 3. JWT 无状态认证（JJWT 0.12.6）

**作用**：无状态登录态，适合前后端分离与多实例部署。

**JWT 三部分**：
1. **Header**：`{"alg":"HS256","typ":"JWT"}` —— 签名算法
2. **Payload**：`{"sub":userId,"iat":签发时间,"exp":过期时间}` —— 存用户 ID
3. **Signature**：`HMACSHA256(base64(Header) + "." + base64(Payload), 密钥)` —— 防篡改

**认证流程**：登录签发 → 前端 localStorage 存储 → 请求带 `Authorization: Bearer <token>` → JwtInterceptor 校验 → 放行。

**源码对应**：`util/JwtUtil.java`、`config/JwtInterceptor.java`、`config/WebConfig.java`（放行 `/api/auth/**`）。

**面试要点**：
- Session 与 JWT 对比：Session 服务端存储、可主动失效；JWT 无状态、天然支持水平扩展，但**无法主动吊销**
- JWT 安全：密钥保密、过期时间、Payload 不放敏感信息
- 常见漏洞：算法混淆攻击（改为 none / HS256 用公钥当密钥）—— JJWT 库已内置防护

### 4. Spring Security Crypto（BCrypt）

**作用**：密码不存明文，存 BCrypt 哈希。

**核心原理**：
- BCrypt 内置随机盐，每次哈希结果不同
- `matches()` 从哈希中提取盐重新校验
- 计算刻意慢（约 100ms），暴力破解成本高

**面试要点**：
- 为什么不用 MD5/SHA（无盐可查表、加盐后仍快）
- 彩虹表攻击原理与盐的作用

### 5. Redis 7（缓存）

**作用**：热点数据（单词列表 `word:*`）缓存，减少数据库压力。

**缓存三大问题**（面试高频）：
| 问题 | 现象 | 应对 |
|------|------|------|
| 穿透 | 查不存在的 key 每次都打 DB | 空值缓存 / 布隆过滤器 |
| 击穿 | 热点 key 过期瞬间大量请求打 DB | 互斥锁 / 逻辑过期 |
| 雪崩 | 大量 key 同时过期 | 过期时间加随机值 |

**源码对应**：`config/RedisConfig.java`（RedisTemplate 序列化配置）、`word:*` 系列 key。

**踩坑记录**：数据修复后必须 `del word:*` 清缓存，否则 API 返回旧数据（本项目实战经验，可当面试故事讲）。

### 6. AOP 日志（WebLogAspect）

**作用**：统一记录接口日志，避免每个方法重复写 log。

**核心原理**：`@Aspect` + `@Around`，在 Controller 方法前后织入逻辑；底层是动态代理（JDK 动态代理接口 / CGLIB 子类）。

**AOP 五要素**：切面（Aspect）、切点（Pointcut）、通知（Advice：Before/After/Around/AfterReturning/AfterThrowing）、连接点（JoinPoint）、织入（Weaving）。

### 7. Spring Task 定时任务

**作用**：每天固定时间聚合统计数据写 `daily_stats` 表。

**核心原理**：`@Scheduled(cron = "...")`，cron 格式 `秒 分 时 日 月 周`。

**源码对应**：`task/DailyStatsTask.java`。

**面试要点**：分布式环境下的定时任务幂等 / 分布式锁（ShedLock、Quartz 集群），单机 @Scheduled 的局限。

### 8. springdoc-openapi

**作用**：自动生成 Swagger UI（`/doc.html`），方便联调与面试演示。

---

## 二、前端层

### 1. 原生 JS 模块化（ES Module）
- 9 个 JS 文件按功能拆分：api / auth / word / quiz / exam / kana / checkin / wrong / app
- `import/export` 浏览器原生支持，无打包工具
- 展示模块化思维，无需引入 Vue/React 也能讲清"关注点分离"

### 2. fetch + async/await
- `api.js` 封装统一 `request()`：拼 baseURL、带 Authorization 头、解析 `Result<T>`、统一错误处理

### 3. localStorage
- JWT 存浏览器本地，刷新不丢登录态
- 面试可提 trade-off：localStorage 有 XSS 风险；生产级方案是 httpOnly Cookie + CSRF 防护

---

## 三、工程化与部署层

### 1. Docker 多阶段构建
- 阶段 1：`maven:3.9-eclipse-temurin-17` 编译打包
- 阶段 2：`eclipse-temurin:17-jre` 只拷贝 jar
- 好处：镜像小、无编译工具、更安全
- 为什么 Java 17：Spring Boot 3.x 强制要求

### 2. Docker Compose 三容器编排
- mysql:8（宿主机 3308）+ redis:7（6380）+ backend（8080）
- compose 网络容器互通；环境变量注入 7 项云配置

### 3. TiDB Cloud Serverless（云数据库）
- 兼容 MySQL 协议、Serverless 免运维、免费额度
- 本地 MySQL 代码零改动，JDBC URL + TLS（`sslMode=REQUIRED`）

### 4. Upstash Redis（云 Redis）
- Serverless Redis，TLS + 密码连接，免费档够用

### 5. Hugging Face Spaces（前端静态托管）
- Static Space 免费托管静态文件

### 6. localhost.run SSH 隧道 + launchd 守护
- `ssh -R 80:localhost:8080 lhr.life` 本机端口映射公网（临时演示）
- launchd（`com.marvis.jptunnel.plist`）：开机自启、崩溃拉起、URL 漂移自动同步前端
- 局限：地址随机、依赖本机在线 → 正式方案待云端部署

---

## 四、业务领域层

### 1. SM-2 间隔重复算法（SRS）★ 项目核心亮点

**原理**：根据遗忘曲线，在"快要忘记"时安排复习。

**状态变量**（存 `word_review` 表）：
- `easinessFactor`（EF）：难度系数，初始 2.5，范围 [1.3, 2.5+]
- `interval`：间隔天数
- `repetitions`：连续答对次数

**调度规则**：
| 反馈 | repetitions | interval | EF 调整 |
|------|-----------|----------|---------|
| 答对（第 1 次） | +1 | 1 天 | — |
| 答对（第 2 次） | +1 | 6 天 | — |
| 答对（第 3 次起） | +1 | interval × EF | — |
| 答错 | 重置 0 | 1 天 | — |
| 简单 | — | — | +0.1 |
| 困难 | — | — | −0.15（下限 1.3） |

**面试价值**：Anki 的原型算法，讲出"根据反馈动态调整复习节奏"体现算法设计能力。

### 2. JLPT 词库建模
- `word` 表：单词 / 假名 / 释义 / 等级（N3/N4/N5）
- `question` + `question_option`：一对多题库建模，选项外键关联题目
- 数据规模：1377 词 / 120 题 / 480 选项

### 3. 每日统计聚合（预计算思想）
- 不实时算（性能差），`@Scheduled` 每天凌晨聚合前一天数据写 `daily_stats`
- 体现"空间换时间 / 物化视图"思想

### 4. 统一返回体
- `Result<T>`：`{code, message, data}`
- `PageResult<T>`：`{list, total, page, size, totalPages}`
- API 设计规范性的直接体现

---

## 五、项目速览表

| 维度 | 内容 |
|------|------|
| 数据规模 | 1377 词（N5/N4/N3）、120 题 / 480 选项、14 张表 |
| 后端 | Spring Boot 3.4.1 + MyBatis + MySQL/TiDB + Redis + JWT + AOP + 定时任务 |
| 前端 | 原生 HTML/CSS/JS（ES Module），fetch 调 REST API |
| 部署 | Docker Compose 三容器；前端 HF Static Space；后端临时 SSH 隧道 |
| 核心算法 | SM-2 间隔重复（Anki 原型） |

---

## 六、30 秒项目介绍（面试用）

> "我做了一个前后端分离的日语学习平台。后端 Spring Boot + MyBatis + MySQL，用 JWT 做无状态认证、Redis 缓存热点单词、AOP 统一日志、定时任务生成每日统计；核心亮点是实现了一个基于 SM-2 算法的间隔重复复习系统，能根据遗忘曲线自动安排复习；部署上用了 Docker Compose 一键启动，数据库和缓存都能在本地 MySQL/Redis 与云端 TiDB/Upstash 之间通过环境变量无缝切换。"

## 七、简历项目要点（3 条 bullet）

1. 基于 Spring Boot 3 + MyBatis 实现前后端分离学习平台，14 张表、10+ REST 接口，统一 Result/PageResult 返回体
2. 实现 SM-2 间隔重复复习算法，按遗忘曲线自动调度复习，支持 1377 词库分级背诵
3. Docker Compose 一键部署（MySQL/Redis/后端三容器），数据库与缓存可在本地/云端环境变量无缝切换
*（内容由AI生成，仅供参考）*
