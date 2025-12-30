# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "TaskFlow" [level=1] [ref=e6]
    - paragraph [ref=e7]: Collaborative Task Management
  - generic [ref=e9]:
    - heading "Create Account" [level=2] [ref=e10]
    - generic [ref=e11]: Failed to register
    - generic [ref=e12]:
      - generic [ref=e13]:
        - img
        - textbox "Full name" [ref=e15]: Test User 1767084277302
      - generic [ref=e16]:
        - img
        - textbox "Email address" [ref=e18]: test1767084277302@example.com
      - generic [ref=e19]:
        - img
        - textbox "Password" [ref=e21]: password123
        - button [ref=e22] [cursor=pointer]:
          - img [ref=e23]
        - paragraph [ref=e26]: Must be 6+ characters with uppercase letter and number
      - generic [ref=e27]:
        - img
        - textbox "Confirm password" [ref=e29]: password123
        - button [ref=e30] [cursor=pointer]:
          - img [ref=e31]
      - button "Create Account" [ref=e34] [cursor=pointer]:
        - img [ref=e35]
        - text: Create Account
    - paragraph [ref=e38]:
      - text: Already have an account?
      - link "Sign in" [ref=e39] [cursor=pointer]:
        - /url: /login
```