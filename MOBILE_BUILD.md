# 모바일 앱 빌드 가이드 (Mobile Build Guide)

웹 빌드(Vercel)와 별개로, 안드로이드 및 아이폰용 앱을 제작하는 방법입니다.

## 1. 공통 준비 단계

모든 모바일 빌드 전에는 반드시 웹 소스를 먼저 컴파일해야 합니다.

```bash
npm run build
```

## 2. 안드로이드 (Android)

- **필수 도구**: Android Studio
- **명령어**:

  ```bash
  # 소스 동기화
  npx cap sync android

  # 안드로이드 스튜디오 열기
  npx cap open android
  ```

- **빌드**: 안드로이드 스튜디오에서 `Build` > `Build APK` 선택

## 3. 아이폰 (iOS)

- **필수 도구**: Mac (macOS), Xcode
- **명령어**:

  ```bash
  # 플랫폼 추가 (최초 1회)
  npx cap add ios

  # 소스 동기화
  npx cap sync ios

  # Xcode 열기
  npx cap open ios
  ```

- **빌드**: Xcode에서 타겟 기기 선택 후 `Run` 또는 `Archive`

## 4. 코드 수정 후 반영 (Hot-reload 아님)

코드를 수정했다면 항상 아래 순서를 따르세요:

1. `npm run build`
2. `npx cap sync`
3. 안드로이드 스튜디오 또는 Xcode에서 다시 실행(Run)
