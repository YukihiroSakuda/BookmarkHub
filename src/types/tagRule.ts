export type MatchType = "starts_with" | "contains" | "ends_with";
export type TargetField = "title" | "url";

export interface TagRule {
  id: string;
  matchType: MatchType;
  pattern: string;
  tagId: string;
  targetField: TargetField;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TagRuleFormData {
  matchType: MatchType;
  pattern: string;
  tagId: string;
  targetField: TargetField;
}
