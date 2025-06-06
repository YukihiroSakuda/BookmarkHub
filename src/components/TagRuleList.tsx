import { Button } from "./Button";
import { Tag } from "./Tag";
import { TagRule } from "../types/tagRule";
import { Trash2 } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TagRuleListProps {
  rules: TagRule[];
  availableTags: Tag[];
  onDelete: (ruleId: string, removeTags: boolean) => void;
}

const getRuleSentence = (rule: TagRule, availableTags: Tag[]) => {
  const field = rule.targetField === "title" ? "Title" : "URL";
  const match =
    rule.matchType === "starts_with"
      ? "starts with"
      : rule.matchType === "contains"
      ? "contains"
      : "ends with";
  const tag = availableTags.find((t) => t.id === rule.tagId);
  return (
    <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center flex-wrap">
      <span>
        If the {field} {match} &quot;{rule.pattern}&quot;, add tag:
      </span>
      {tag && (
        <span className="ml-1 inline-block">
          <Tag tag={tag.name} isSelected={true} />
        </span>
      )}
    </div>
  );
};

export const TagRuleList = ({
  rules,
  availableTags,
  onDelete,
}: TagRuleListProps) => {
  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="p-4 border rounded-lg dark:border-neutral-700"
        >
          <div className="flex justify-between items-start mb-2">
            <div>{getRuleSentence(rule, availableTags)}</div>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => {
                const removeTags = window.confirm(
                  "Do you want to remove the tags added by this rule? (Cancel to delete only the rule)"
                );
                onDelete(rule.id, removeTags);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
