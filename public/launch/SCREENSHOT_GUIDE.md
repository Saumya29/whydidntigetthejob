# Screenshot Guide for ProductHunt Launch

## Required Screenshots

### 1. Landing Page Hero (screenshot-1-landing.png)
**Page:** `/` (homepage)
**Viewport:** 1440x900
**What to capture:**
- Full hero section
- Tagline visible
- CTA button
- Dark theme

### 2. Input Form (screenshot-2-form.png)
**Page:** `/analyze` (after payment)
**Viewport:** 1440x900
**What to capture:**
- Resume paste area with sample text
- Job description paste area with sample text
- "Get Roasted" button
- Professional looking sample content

**Sample Resume Text:**
```
JOHN DOE
Senior Software Engineer

EXPERIENCE
TechCorp Inc. — Software Engineer (2020-2023)
- Built REST APIs using Node.js
- Worked with React frontend
- Collaborated with team members
```

**Sample JD Text:**
```
Senior Software Engineer - Stripe

We're looking for a Senior Engineer to join our Payments team.

Requirements:
- 5+ years of experience in backend development
- Experience with distributed systems at scale
- Strong communication and leadership skills
- Experience with payment systems preferred
```

### 3. Roast Results (screenshot-3-results.png)
**Page:** `/results/[id]` (with completed roast)
**Viewport:** 1440x900
**What to capture:**
- Roast grade prominently displayed (show a C or C+ for relatability)
- "What the hiring manager probably said" section
- Skill gap breakdown
- Full card visible

**Ideal Grade to Show:** C+ or B- (relatable but not devastating)

### 4. OG Image Style (thumbnail.png)
**Size:** 1270x760px
**Generator:** `/api/og/[id]` or custom design

**Elements:**
- Dark gradient background (#0a0a0a → #1a1a1a)
- App logo/name
- Tagline: "Get brutally honest feedback on why you didn't get the job"
- Mockup of roast card with grade
- Fire emoji 🔥

---

## Demo GIF Requirements

**Duration:** 15-20 seconds
**Resolution:** 800x600 or 1200x750
**FPS:** 15-24

**Flow to capture:**
1. Start on landing page (2 sec)
2. Click "Get Started" (transition)
3. Show form with pre-filled content (3 sec)
4. Click "Get Roasted" (1 sec)
5. Loading state (1-2 sec)
6. Results appear with grade reveal (4 sec)
7. Scroll to show skill gaps (3 sec)
8. End frame on grade (2 sec)

**Tools:**
- Kap (Mac): https://getkap.co
- ScreenToGif (Windows)
- Cleanshot X

---

## Color Palette Reference

```css
--bg: #0a0a0a
--card: #141414
--border: #262626
--text: #f5f5f5
--muted: #888888
--accent: #f97316 (orange for grade)
--grade-a: #22c55e
--grade-b: #84cc16
--grade-c: #eab308
--grade-d: #f97316
--grade-f: #ef4444
```

---

## Tips

1. Use Cleanshot X or similar for pixel-perfect screenshots
2. Hide browser UI (use presentation mode)
3. Ensure dark mode is active
4. Check for any console errors before capturing
5. Use sample data that tells a story (not lorem ipsum)
