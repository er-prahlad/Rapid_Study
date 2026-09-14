# Git Workflow — RapidStudy

## Branch Strategy

```
main          ← production (always deployable)
develop       ← integration branch
feature/*     ← new features
fix/*         ← bug fixes
hotfix/*      ← urgent production fixes
```

## Commit Convention

```
feat:   New feature
fix:    Bug fix
docs:   Documentation
style:  Formatting
refactor: Code restructure
test:   Adding tests
chore:  Build/config changes
```

## Examples
```bash
feat: add leaderboard Redis caching
fix: V19 migration paper_year SMALLINT to INT
docs: update README setup guide
test: add score calculation unit tests
```
