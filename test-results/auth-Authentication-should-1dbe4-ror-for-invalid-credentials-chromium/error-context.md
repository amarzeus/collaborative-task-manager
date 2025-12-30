# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "TaskFlow" [level=1] [ref=e6]
    - paragraph [ref=e7]: Collaborative Task Management
  - generic [ref=e9]:
    - heading "Welcome back" [level=2] [ref=e10]
    - generic [ref=e11]: Failed to login
    - generic [ref=e12]:
      - generic [ref=e13]:
        - img
        - textbox "Email address" [ref=e15]: invalid@example.com
      - generic [ref=e16]:
        - img
        - textbox "Password" [ref=e18]: wrongpassword
        - button [ref=e19] [cursor=pointer]:
          - img [ref=e20]
      - button "Sign In" [ref=e23] [cursor=pointer]:
        - img [ref=e24]
        - text: Sign In
    - paragraph [ref=e27]:
      - text: Don't have an account?
      - link "Sign up" [ref=e28] [cursor=pointer]:
        - /url: /register
```