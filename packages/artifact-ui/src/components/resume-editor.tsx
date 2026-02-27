"use client";

import { Input, Textarea, Button, Label } from "@uxin/ui";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { parseStructuredContent } from "../lib/utils";
import { Editor } from "./text-editor";

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  year: string;
}

interface ResumeData {
  name: string;
  title?: string;
  summary?: string;
  skills?: string[];
  experiences?: Experience[];
  education?: Education[];
  location?: string;
}

export function ResumeEditor(props: React.ComponentProps<typeof Editor> & { isInline?: boolean }) {
  const { content, onSaveContent, status, isInline } = props;
  const [data, setData] = useState<ResumeData>({
    name: "",
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<ResumeData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  const updateData = (updates: Partial<ResumeData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), false);
  };

  const addExperience = () => {
    const newExp = [
      ...(data.experiences || []),
      { company: "", role: "", duration: "", description: "" },
    ];
    updateData({ experiences: newExp });
  };

  const removeExperience = (index: number) => {
    const newExp = [...(data.experiences || [])];
    newExp.splice(index, 1);
    updateData({ experiences: newExp });
  };

  const addEducation = () => {
    const newEdu = [...(data.education || []), { school: "", degree: "", year: "" }];
    updateData({ education: newEdu });
  };

  const removeEducation = (index: number) => {
    const newEdu = [...(data.education || [])];
    newEdu.splice(index, 1);
    updateData({ education: newEdu });
  };

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing resume data. Switching to raw text editor.
        </div>
        <Editor {...props} />
      </div>
    );
  }

  if (isInline) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {data.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="font-bold text-lg">{data.name || "未命名简历"}</h3>
            <p className="text-sm text-muted-foreground">{data.title || "暂无职位信息"}</p>
          </div>
        </div>

        {data.summary && (
          <div className="text-sm text-muted-foreground line-clamp-2 italic">"{data.summary}"</div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          {data.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">地区:</span> {data.location}
            </div>
          )}
          {data.experiences && data.experiences.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">工作经验:</span> {data.experiences.length} 段
            </div>
          )}
          {data.skills && data.skills.length > 0 && (
            <div className="col-span-2 flex flex-wrap gap-1 mt-1">
              {data.skills.slice(0, 5).map((skill, i) => (
                <span
                  key={`skill-${i}-${skill}`}
                  className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-medium"
                >
                  {skill}
                </span>
              ))}
              {data.skills.length > 5 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{data.skills.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Name</Label>
            <Input
              value={data.name || ""}
              onChange={(e) => updateData({ name: e.target.value })}
              placeholder="Name"
              disabled={status === "streaming"}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Title</Label>
            <Input
              value={data.title || ""}
              onChange={(e) => updateData({ title: e.target.value })}
              placeholder="Professional Title"
              disabled={status === "streaming"}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Location</Label>
          <Input
            value={data.location || ""}
            onChange={(e) => updateData({ location: e.target.value })}
            placeholder="Location"
            disabled={status === "streaming"}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Summary</Label>
          <Textarea
            value={data.summary || ""}
            onChange={(e) => updateData({ summary: e.target.value })}
            placeholder="Professional Summary"
            rows={3}
            disabled={status === "streaming"}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Skills (comma separated)</Label>
          <Input
            value={data.skills?.join(", ") || ""}
            onChange={(e) =>
              updateData({
                skills: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Skills"
            disabled={status === "streaming"}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Experience</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addExperience}
            disabled={status === "streaming"}
          >
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
        {data.experiences?.map((exp, index) => (
          <div
            key={`experience-${index}`}
            className="border p-4 rounded-md space-y-2 relative group"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeExperience(index)}
              disabled={status === "streaming"}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <div className="grid grid-cols-2 gap-2 pr-8">
              <Input
                value={exp.company || ""}
                onChange={(e) => {
                  const newExp = [...(data.experiences || [])];
                  newExp[index] = { ...exp, company: e.target.value };
                  updateData({ experiences: newExp });
                }}
                placeholder="Company"
                disabled={status === "streaming"}
              />
              <Input
                value={exp.role || ""}
                onChange={(e) => {
                  const newExp = [...(data.experiences || [])];
                  newExp[index] = { ...exp, role: e.target.value };
                  updateData({ experiences: newExp });
                }}
                placeholder="Role"
                disabled={status === "streaming"}
              />
            </div>
            <Input
              value={exp.duration || ""}
              onChange={(e) => {
                const newExp = [...(data.experiences || [])];
                newExp[index] = { ...exp, duration: e.target.value };
                updateData({ experiences: newExp });
              }}
              placeholder="Duration"
              disabled={status === "streaming"}
            />
            <Textarea
              value={exp.description || ""}
              onChange={(e) => {
                const newExp = [...(data.experiences || [])];
                newExp[index] = { ...exp, description: e.target.value };
                updateData({ experiences: newExp });
              }}
              placeholder="Description"
              rows={3}
              disabled={status === "streaming"}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Education</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addEducation}
            disabled={status === "streaming"}
          >
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
        {data.education?.map((edu, index) => (
          <div
            key={`education-${index}`}
            className="border p-4 rounded-md space-y-2 relative group"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeEducation(index)}
              disabled={status === "streaming"}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <div className="grid grid-cols-2 gap-2 pr-8">
              <Input
                value={edu.school || ""}
                onChange={(e) => {
                  const newEdu = [...(data.education || [])];
                  newEdu[index] = { ...edu, school: e.target.value };
                  updateData({ education: newEdu });
                }}
                placeholder="School"
                disabled={status === "streaming"}
              />
              <Input
                value={edu.degree || ""}
                onChange={(e) => {
                  const newEdu = [...(data.education || [])];
                  newEdu[index] = { ...edu, degree: e.target.value };
                  updateData({ education: newEdu });
                }}
                placeholder="Degree"
                disabled={status === "streaming"}
              />
            </div>
            <Input
              value={edu.year || ""}
              onChange={(e) => {
                const newEdu = [...(data.education || [])];
                newEdu[index] = { ...edu, year: e.target.value };
                updateData({ education: newEdu });
              }}
              placeholder="Year"
              disabled={status === "streaming"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
