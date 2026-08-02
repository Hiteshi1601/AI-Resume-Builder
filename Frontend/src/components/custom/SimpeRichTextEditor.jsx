import React, { useEffect, useState } from "react";
import {
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnUnderline,
  Editor,
  EditorProvider,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import { AIChatSession } from "@/Services/AiModel";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Sparkles, LoaderCircle } from "lucide-react";

const PROMPT = `Create a JSON object with the following fields:
"projectName": A string representing the project
"techStack":A string representing the project tech stack
"projectSummary": An array of strings, each representing a bullet point in html format describing relevant experience for the given project tittle and tech stack
projectName-"{projectName}"
techStack-"{techStack}"`;
function SimpeRichTextEditor({ index, onRichTextEditorChange, resumeInfo }) {
  const [value, setValue] = useState(
    resumeInfo?.projects[index]?.projectSummary || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onRichTextEditorChange(value);
  }, [value]);

  const GenerateSummaryFromAI = async () => {
    const currentProj = resumeInfo?.projects?.[index] || {};
    const projName = currentProj.projectName || "Full Stack Project";
    const stack = currentProj.techStack || "React, Node.js, Express, MongoDB";

    setLoading(true);
    try {
      const prompt = PROMPT.replace("{projectName}", projName).replace("{techStack}", stack);
      console.log("Prompt:", prompt);
      const result = await AIChatSession.sendMessage(prompt);
      const rawText = await result.response.text();
      const cleanText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const resp = JSON.parse(cleanText);
      console.log("Response:", resp);

      const summaryHTML = Array.isArray(resp.projectSummary)
        ? resp.projectSummary.join("")
        : typeof resp.projectSummary === "string"
        ? resp.projectSummary
        : Array.isArray(resp.experience)
        ? resp.experience.join("")
        : `<li>Developed <strong>${projName}</strong> using ${stack}.</li>`;

      setValue(summaryHTML);
      onRichTextEditorChange(summaryHTML);
      toast.success("Project summary generated");
    } catch (error) {
      console.error("Project AI Error:", error);
      toast.error(error?.message || "Failed to generate project summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between my-2">
        <label className="text-xs">Summery</label>
        <Button
          variant="outline"
          size="sm"
          onClick={GenerateSummaryFromAI}
          disabled={loading}
          className="flex gap-2 border-primary text-primary"
        >
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate from AI
            </>
          )}
        </Button>
      </div>
      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onRichTextEditorChange(value);
          }}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  );
}

export default SimpeRichTextEditor;
