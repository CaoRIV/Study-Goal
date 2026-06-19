alter table public.skills
drop constraint if exists skills_category_check;

alter table public.skills
add constraint skills_category_check check (
  category in (
    'subject_expertise',
    'digital_tools',
    'research_analysis',
    'communication',
    'teamwork_leadership',
    'creative_design',
    'project_management',
    'language',
    'career',
    'programming',
    'machine_learning',
    'deep_learning',
    'nlp',
    'computer_vision',
    'research',
    'github_portfolio',
    'kaggle_projects'
  )
);
