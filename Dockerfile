# ---------- 阶段1：构建 ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# 先拷贝 pom.xml 并预下载依赖，利用 Docker 层缓存加速后续构建
COPY pom.xml .
RUN mvn dependency:go-offline -B
# 再拷贝源码并打包
COPY src ./src
RUN mvn package -DskipTests -B

# ---------- 阶段2：运行 ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
# 只把打好 jar 拷进运行镜像，镜像体积更小
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
