# RapidStudy - Testing Guide

## Testing Strategy

RapidStudy implements comprehensive testing at multiple levels:

```
┌─────────────────────────────────┐
│       E2E Tests (Future)        │  Manual + Automated
├─────────────────────────────────┤
│       Integration Tests         │  API + Database
├─────────────────────────────────┤
│         Unit Tests              │  Services, Utils
└─────────────────────────────────┘
```

---

## Backend Testing (Java/Spring Boot)

### Test Structure

```
backend/src/test/java/com/rapidstudy/
├── controller/      # Controller tests (MockMvc)
├── service/         # Service tests (Mockito)
├── repository/      # Repository tests (DataJpaTest)
├── security/        # Security tests
└── integration/     # Integration tests
```

### Unit Tests

#### Service Layer Test Example

```java
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtService jwtService;
    
    @InjectMocks
    private AuthService authService;
    
    @Test
    void register_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("SecurePass123!");
        
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtService.generateToken(any())).thenReturn("jwt_token");
        
        // Act
        AuthResponse response = authService.register(request);
        
        // Assert
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("John Doe", response.getUser().getName());
        verify(userRepository).save(any(User.class));
    }
    
    @Test
    void register_EmailExists_ThrowsException() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        
        when(userRepository.existsByEmail(anyString())).thenReturn(true);
        
        // Act & Assert
        assertThrows(ConflictException.class, () -> authService.register(request));
    }
}
```

### Controller Tests

```java
@WebMvcTest(AuthController.class)
class AuthControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private AuthService authService;
    
    @Test
    void register_ValidRequest_ReturnsToken() throws Exception {
        // Arrange
        AuthResponse mockResponse = new AuthResponse();
        mockResponse.setToken("jwt_token");
        
        when(authService.register(any())).thenReturn(mockResponse);
        
        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "name": "John Doe",
                        "email": "john@example.com",
                        "password": "SecurePass123!",
                        "confirmPassword": "SecurePass123!"
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists());
    }
    
    @Test
    void register_InvalidEmail_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "name": "John Doe",
                        "email": "invalid-email",
                        "password": "SecurePass123!"
                    }
                    """))
                .andExpect(status().isBadRequest());
    }
}
```

### Repository Tests

```java
@DataJpaTest
class UserRepositoryTest {
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void findByEmail_UserExists_ReturnsUser() {
        // Arrange
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setPasswordHash("hashed");
        userRepository.save(user);
        
        // Act
        Optional<User> found = userRepository.findByEmail("john@example.com");
        
        // Assert
        assertTrue(found.isPresent());
        assertEquals("John Doe", found.get().getName());
    }
    
    @Test
    void existsByEmail_EmailExists_ReturnsTrue() {
        // Arrange
        User user = new User();
        user.setEmail("existing@example.com");
        user.setPasswordHash("hashed");
        userRepository.save(user);
        
        // Act
        boolean exists = userRepository.existsByEmail("existing@example.com");
        
        // Assert
        assertTrue(exists);
    }
}
```

### Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TestAttemptIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MockTestRepository mockTestRepository;
    
    @Autowired
    private JwtService jwtService;
    
    private String authToken;
    
    @BeforeEach
    void setUp() {
        // Create test user
        User user = new User();
        user.setEmail("test@example.com");
        user.setPasswordHash("hashed");
        user = userRepository.save(user);
        
        // Generate token
        authToken = jwtService.generateToken(user);
    }
    
    @Test
    void startTest_ValidTest_CreatesAttempt() throws Exception {
        // Arrange
        MockTest test = createMockTest();
        
        // Act & Assert
        mockMvc.perform(post("/api/tests/" + test.getId() + "/attempts")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.attemptId").exists())
                .andExpect(jsonPath("$.data.expiresAt").exists());
    }
}
```

### Running Backend Tests

```powershell
# All tests
cd backend
.\mvnw.cmd test

# Specific test class
.\mvnw.cmd test -Dtest=AuthServiceTest

# Specific test method
.\mvnw.cmd test -Dtest=AuthServiceTest#register_Success

# With coverage
.\mvnw.cmd test jacoco:report
# View: target/site/jacoco/index.html

# Integration tests only
.\mvnw.cmd test -Dtest=*IntegrationTest

# Skip tests during build
.\mvnw.cmd package -DskipTests
```

---

## Frontend Testing (Next.js/React)

### Test Structure

```
frontend/
├── __tests__/
│   ├── components/
│   ├── pages/
│   └── services/
└── src/
    └── components/
        └── Button.test.tsx
```

### Component Tests

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### API Service Tests

```typescript
// authApi.test.ts
import { authApi } from './authApi';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('authApi', () => {
  it('register calls API with correct data', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          token: 'jwt_token',
          user: { id: 1, name: 'John' }
        }
      }
    };
    
    mockedAxios.post.mockResolvedValue(mockResponse);
    
    const result = await authApi.register({
      name: 'John',
      email: 'john@example.com',
      password: 'pass123'
    });
    
    expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
    expect(result.data.token).toBe('jwt_token');
  });
});
```

### Running Frontend Tests

```powershell
cd frontend

# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific file
npm test Button.test.tsx
```

---

## Android Testing

### Unit Tests

```kotlin
// AuthViewModelTest.kt
class AuthViewModelTest {
    
    @Mock
    lateinit var authRepository: AuthRepository
    
    private lateinit var viewModel: AuthViewModel
    
    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        viewModel = AuthViewModel(authRepository)
    }
    
    @Test
    fun `login with valid credentials sets success state`() = runTest {
        // Arrange
        val request = LoginRequest("email", "password")
        val response = AuthResponse(token = "jwt_token")
        
        `when`(authRepository.login(request)).thenReturn(Result.success(response))
        
        // Act
        viewModel.login(request)
        
        // Assert
        assert(viewModel.authState.value is AuthState.Success)
    }
}
```

### Running Android Tests

```powershell
cd android

# Unit tests
.\gradlew.bat test

# Instrumented tests (requires emulator/device)
.\gradlew.bat connectedAndroidTest

# Specific test
.\gradlew.bat test --tests AuthViewModelTest
```

---

## Test Coverage Goals

### Minimum Coverage Targets

- **Backend Services:** 80%
- **Backend Controllers:** 70%
- **Backend Repositories:** 60%
- **Frontend Components:** 70%
- **Frontend Services:** 80%

---

## Critical Test Scenarios

### 1. Authentication Tests

- ✅ Registration with valid data
- ✅ Registration with duplicate email
- ✅ Login with correct credentials
- ✅ Login with wrong password
- ✅ JWT token generation and validation
- ✅ Token expiration handling

### 2. Test Attempt Tests

- ✅ Start test creates attempt
- ✅ Save answer updates attempt
- ✅ Server validates timer expiration
- ✅ Score calculation is correct
- ✅ Prevent duplicate submission
- ✅ User can only access own attempts

### 3. Score Calculation Tests

```java
@Test
void calculateScore_MixedAnswers_CorrectScore() {
    // 10 correct (10 × 2 = 20)
    // 2 wrong (2 × -0.5 = -1)
    // 3 unanswered (3 × 0 = 0)
    // Expected: 19
    
    TestAttempt attempt = createAttemptWithAnswers(10, 2, 3);
    double score = scoreService.calculateScore(attempt);
    
    assertEquals(19.0, score, 0.01);
}

@Test
void calculateScore_AllCorrect_FullMarks() {
    TestAttempt attempt = createAttemptWithAnswers(25, 0, 0);
    double score = scoreService.calculateScore(attempt);
    
    assertEquals(50.0, score, 0.01);
}

@Test
void calculateScore_AllWrong_NegativeScore() {
    TestAttempt attempt = createAttemptWithAnswers(0, 25, 0);
    double score = scoreService.calculateScore(attempt);
    
    assertEquals(-12.5, score, 0.01);
}
```

### 4. Authorization Tests

```java
@Test
@WithMockUser(roles = "STUDENT")
void student_CannotAccessAdminEndpoint() throws Exception {
    mockMvc.perform(get("/api/admin/users"))
            .andExpect(status().isForbidden());
}

@Test
@WithMockUser(roles = "ADMIN")
void admin_CanAccessAdminEndpoint() throws Exception {
    mockMvc.perform(get("/api/admin/users"))
            .andExpect(status().isOk());
}

@Test
void attemptOwner_CanAccessOwnAttempt() {
    // User 1 creates attempt
    // User 1 can access it
    // User 2 cannot access it
}
```

---

## Manual Testing Checklist

### Before Each Release

#### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Refresh token works
- [ ] Logout works
- [ ] Invalid credentials rejected

#### Test Flow
- [ ] Browse exams
- [ ] View test details
- [ ] Start test
- [ ] Timer counts down
- [ ] Save answers
- [ ] Mark for review
- [ ] Navigate questions
- [ ] Submit test
- [ ] View result
- [ ] View analysis

#### Admin Functions
- [ ] Create exam
- [ ] Create subject
- [ ] Create question
- [ ] Import questions
- [ ] Create mock test
- [ ] Publish test

#### Mobile App
- [ ] Login works
- [ ] Test attempt works
- [ ] Offline handling
- [ ] Push notifications (future)

---

## Performance Testing

### Load Testing Script (k6)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function() {
  // Login
  let loginRes = http.post('http://localhost:8080/api/auth/login', JSON.stringify({
    email: 'test@example.com',
    password: 'password'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
  
  let token = loginRes.json('data.token');
  
  // Get exams
  let examsRes = http.get('http://localhost:8080/api/exams', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  check(examsRes, {
    'exams retrieved': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

Run:
```powershell
k6 run load-test.js
```

---

## CI/CD Integration (Future)

### GitHub Actions Example

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: rapidstudy_test
          MYSQL_USER: test_user
          MYSQL_PASSWORD: test_pass
          MYSQL_ROOT_PASSWORD: root
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Run tests
        run: |
          cd backend
          ./mvnw test
      
      - name: Generate coverage report
        run: ./mvnw jacoco:report
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-21
