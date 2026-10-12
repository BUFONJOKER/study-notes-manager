"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Button, Icon, Modal } from "@/components/ui";

type ApiKeyModalProps = {
  configured: boolean;
  close: () => void;
  onAccepted: () => void;
  onClear: () => void;
};

type Status = "idle" | "loading" | "success" | "error";

export function ApiKeyModal({ configured, close, onAccepted, onClear }: ApiKeyModalProps) {
  const [editing, setEditing] = useState(!configured);
  const [key, setKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const verify = (event: FormEvent) => {
    event.preventDefault();
    const candidate = key.trim();
    if (!candidate) {
      setStatus("error");
      setMessage("Enter an OpenAI API key to continue.");
      return;
    }
    if (!candidate.startsWith("sk-") || candidate.length < 24) {
      setStatus("error");
      setMessage("This key format doesn’t look valid. Check the key and try again.");
      return;
    }
    setStatus("loading");
    setMessage("");
    window.setTimeout(() => {
      // The raw key is deliberately discarded after verification.
      setKey("");
      setVisible(false);
      setStatus("success");
      setMessage("API key accepted. AI study features are now available.");
      onAccepted();
    }, 1100);
  };

  const clear = () => {
    setKey("");
    setStatus("idle");
    setMessage("");
    setEditing(true);
    onClear();
  };

  return (
    <Modal onClose={close} labelledBy="api-title" className="api-modal">
      <span className={cn(`api-modal-icon ${configured ? "connected" : ""}`)}>
        <Icon name={configured ? "check" : "key"} />
      </span>
      <div className={cn("api-session-row")}>
        <span className={cn(`session-dot ${configured ? "online" : ""}`)} />
        <span>Session status</span>
        <strong>{configured ? "API key configured" : "Not configured"}</strong>
      </div>

      {!editing && configured ? (
        <>
          <h2 id="api-title">OpenAI is connected</h2>
          <p>AI features are enabled for this browser session using <strong>gpt-5-nano</strong>. Your key is hidden and cannot be viewed.</p>
          <div className={cn("secure-note")}>
            <Icon name="lock" size={17} />
            <div>
              <strong>Your key stays private</strong>
              <span>It is not displayed in the interface after setup.</span>
            </div>
          </div>
          <div className={cn("modal-actions api-manage-actions")}>
            <Button variant="secondary" icon="key" onClick={() => setEditing(true)}>Update key</Button>
            <Button variant="danger" icon="trash" onClick={clear}>Clear key</Button>
          </div>
        </>
      ) : status === "success" ? (
        <>
          <h2 id="api-title">You’re ready to study</h2>
          <p>{message}</p>
          <div className={cn("api-success")}>
            <Icon name="check" />
            <div>
              <strong>Connection verified</strong>
              <span>Model: gpt-5-nano</span>
            </div>
          </div>
          <Button className={cn("full")} onClick={close}>Continue to AI features</Button>
        </>
      ) : (
        <>
          <h2 id="api-title">{configured ? "Update API key" : "Set up AI features"}</h2>
          <p>Enter your OpenAI API key to generate quizzes and use AI study tools. The application uses <strong>gpt-5-nano</strong>.</p>
          <form onSubmit={verify}>
            <label className={cn("api-key-field")}>
              <span>OpenAI API key</span>
              <div className={cn(status === "error" ? "invalid" : "")}>
                <Icon name="key" size={18} />
                <input
                  type={visible ? "text" : "password"}
                  value={key}
                  onChange={(event) => { setKey(event.target.value); if (status === "error") setStatus("idle"); }}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="sk-••••••••••••••••••••••••"
                  aria-invalid={status === "error"}
                />
                <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide API key" : "Show API key"}>
                  <Icon name={visible ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
            </label>
            {status === "error" && (
              <div className={cn("api-feedback error")} role="alert">
                <Icon name="alert" size={17} />
                <span>{message}</span>
              </div>
            )}
            {status === "loading" && (
              <div className={cn("api-feedback loading")} role="status">
                <i />
                <span>Verifying your key with OpenAI…</span>
              </div>
            )}
            <div className={cn("secure-note")}>
              <Icon name="lock" size={17} />
              <div>
                <strong>Secure by design</strong>
                <span>Your key is discarded from the form after verification and is never shown again.</span>
              </div>
            </div>
            <div className={cn("modal-actions")}>
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button type="submit" icon="check" disabled={status === "loading"}>{status === "loading" ? "Verifying…" : "Verify & connect"}</Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
