#!/bin/bash

OUTPUT_FILE="skills/project-manager/ui/project.json"

cat <<EOF > "$OUTPUT_FILE"
{
  "requirements": [
EOF

# Generate requirements
find .project/requirements -name "*.md" -print0 | sort -z | while IFS= read -r -d '' f; do
  NAME=$(basename "$f" .md)
  # JSON escape: backslash -> double backslash, double quote -> escaped quote, newline -> \n
  CONTENT=$(cat "$f" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')
  echo "    { \"id\": \"$NAME\", \"content\": \"$CONTENT\" },"
done | sed '$ s/,$//' >> "$OUTPUT_FILE"

cat <<EOF >> "$OUTPUT_FILE"
  ],
  "tasks": [
EOF

# Generate tasks
if [ -f ".project/backlog/tasks.csv" ]; then
  while IFS="|" read -r id desc status; do
    id=$(echo "$id" | xargs)
    desc=$(echo "$desc" | xargs)
    status=$(echo "$status" | xargs)
    if [ -n "$id" ]; then
      echo "    { \"id\": \"$id\", \"description\": \"$desc\", \"status\": \"$status\" },"
    fi
  done < .project/backlog/tasks.csv | sed '$ s/,$//' >> "$OUTPUT_FILE"
fi

cat <<EOF >> "$OUTPUT_FILE"
  ]
}
EOF

echo "Generated $OUTPUT_FILE"
