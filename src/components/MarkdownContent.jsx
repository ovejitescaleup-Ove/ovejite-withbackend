import ReactMarkdown from "react-markdown";

export default function MarkdownContent({ children }) {
  return (
    <div className="space-y-5 text-slate-600 leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6">
      <ReactMarkdown>{children || ""}</ReactMarkdown>
    </div>
  );
}
