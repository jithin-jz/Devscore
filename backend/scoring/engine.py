"""
DevScore Scoring Engine

Computes 5 category scores (0–100) from GitHub data:
- Engineering Depth: language diversity, CI/Docker adoption, repo complexity
- Code Discipline: test coverage, linting, type usage
- Collaboration: PRs, issues, external contributions
- Consistency: commit frequency, active days, streaks
- OSS Impact: stars, forks, non-fork public repos

Uses clamped scaling instead of raw counts to prevent gaming.
"""

import math


def clamp(value, min_val=0.0, max_val=100.0):
    """Clamp a value between min and max."""
    return max(min_val, min(max_val, value))


def log_scale(value, midpoint, max_score=100):
    """
    Logarithmic scaling — diminishing returns.
    Reaches ~50 at midpoint, ~90 at 5x midpoint.
    """
    if value <= 0:
        return 0.0
    return clamp(max_score * math.log(1 + value) / math.log(1 + midpoint * 10))


def ratio_score(numerator, denominator, max_score=100):
    """Score based on a ratio, 100% hit = max_score."""
    if denominator == 0:
        return 0.0
    return clamp((numerator / denominator) * max_score)


def calculate_engineering_depth(repos):
    """
    Score based on:
    - Language diversity (unique languages)
    - CI adoption rate across repos
    - Docker usage
    - Repo count and size
    """
    if not repos:
        return 0.0

    languages = set()
    ci_count = 0
    docker_count = 0
    total = len(repos)

    for repo in repos:
        if repo.primary_language:
            languages.add(repo.primary_language)
        if repo.has_ci:
            ci_count += 1
        if repo.has_docker:
            docker_count += 1

    # Language diversity: 1 lang = 10, 3 = 35, 6+ = 60 (max component)
    lang_score = clamp(log_scale(len(languages), 6), 0, 60)

    # CI adoption rate
    ci_ratio = ratio_score(ci_count, total, 25)

    # Docker adoption
    docker_ratio = ratio_score(docker_count, total, 15)

    return clamp(lang_score + ci_ratio + docker_ratio)


def calculate_discipline(repos):
    """
    Score based on:
    - Test presence across repos
    - Lint config presence
    - Type system usage
    """
    if not repos:
        return 0.0

    total = len(repos)
    test_count = sum(1 for r in repos if r.has_tests)
    lint_count = sum(1 for r in repos if r.has_lint)
    type_count = sum(1 for r in repos if r.has_types)

    test_score = ratio_score(test_count, total, 45)
    lint_score = ratio_score(lint_count, total, 30)
    type_score = ratio_score(type_count, total, 25)

    return clamp(test_score + lint_score + type_score)


def calculate_collaboration(metrics):
    """
    Score based on:
    - PRs opened and merged
    - Issues opened and closed
    - External contributions
    """
    if not metrics:
        return 0.0

    pr_score = log_scale(metrics.pr_opened + metrics.pr_merged, 20)
    issue_score = log_scale(metrics.issues_opened + metrics.issues_closed, 15)
    external_score = log_scale(metrics.external_contributions, 5)

    # Weighted combination
    return clamp(pr_score * 0.40 + issue_score * 0.25 + external_score * 0.35)


def calculate_consistency(metrics):
    """
    Score based on:
    - Active days count
    - Commit frequency
    - Max streak
    """
    if not metrics:
        return 0.0

    active_score = log_scale(metrics.active_days, 30)
    commit_score = log_scale(metrics.total_commits, 50)
    streak_score = log_scale(metrics.streak_max, 14)

    return clamp(active_score * 0.35 + commit_score * 0.35 + streak_score * 0.30)


def calculate_oss_impact(repos):
    """
    Score based on:
    - Total stars across repos
    - Total forks
    - Number of non-fork public repos
    """
    if not repos:
        return 0.0

    non_fork_repos = [r for r in repos if not r.is_fork]
    total_stars = sum(r.stars for r in non_fork_repos)
    total_forks = sum(r.forks for r in non_fork_repos)

    star_score = log_scale(total_stars, 50)
    fork_score = log_scale(total_forks, 20)
    repo_count_score = log_scale(len(non_fork_repos), 15)

    return clamp(star_score * 0.45 + fork_score * 0.30 + repo_count_score * 0.25)


def calculate_dev_score(breakdown_dict, weights):
    """
    Calculate the final weighted DevScore from category scores.

    Args:
        breakdown_dict: dict with keys matching weight keys
        weights: dict of category weights (should sum to ~1.0)

    Returns:
        float: Final DevScore 0–100
    """
    score = 0.0
    for category, weight in weights.items():
        score += breakdown_dict.get(category, 0.0) * weight
    return round(clamp(score), 1)
