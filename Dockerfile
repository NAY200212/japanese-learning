# ---------- ステージ1：ビルド ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# 先に pom.xml をコピーして依存を先取りダウンロードし、Docker レイヤーキャッシュで以降のビルドを高速化
COPY pom.xml .
RUN mvn dependency:go-offline -B
# ソースをコピーしてパッケージング
COPY src ./src
RUN mvn package -DskipTests -B

# ---------- ステージ2：実行 ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
# ビルドした jar だけを実行イメージへコピーし、イメージサイズを小さくする
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
