FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY server.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

COPY --from=build /app/out .

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "server.dll"]