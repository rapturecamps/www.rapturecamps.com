import { useState, useCallback } from "react";
import { type StringInputProps, useFormValue, set } from "sanity";
import { Stack, Button, Flex, Text } from "@sanity/ui";

/**
 * Custom string input for the media plugin's alt text field.
 * Wraps the default string input and adds an AI "Generate" button
 * that calls /api/seo-alt with the asset's URL.
 */
export function AltTextWithAI(props: StringInputProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const assetUrl = useFormValue(["url"]) as string | undefined;
  const filename = useFormValue(["originalFilename"]) as string | undefined;
  const assetId = useFormValue(["_id"]) as string | undefined;
  const assetPath = useFormValue(["path"]) as string | undefined;

  // Build image URL from multiple possible sources
  const imageUrl =
    assetUrl ||
    (assetPath
      ? `https://cdn.sanity.io/${assetPath}`
      : assetId
        ? (() => {
            const match = assetId.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
            return match
              ? `https://cdn.sanity.io/images/ypmt1bmc/production/${match[1]}-${match[2]}.${match[3]}`
              : undefined;
          })()
        : undefined);

  const handleGenerate = useCallback(async () => {
    if (!imageUrl) {
      setError("No image URL found — try saving the asset first");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/seo-alt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          context: filename || "",
        }),
      });

      const data = await res.json();

      if (data.success && data.altText) {
        props.onChange(set(data.altText));
        setStatus("idle");
      } else {
        setError(data.error || "Failed to generate");
        setStatus("error");
      }
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }, [imageUrl, filename, props]);

  return (
    <Stack space={2}>
      {props.renderDefault(props)}
      <Flex gap={2} align="center">
        <Button
          text={status === "loading" ? "Generating..." : "Generate with AI"}
          tone="primary"
          mode="ghost"
          fontSize={1}
          padding={2}
          disabled={status === "loading"}
          onClick={handleGenerate}
        />
        {status === "error" && (
          <Text size={1} style={{ color: "#ef4444" }}>
            {error}
          </Text>
        )}
      </Flex>
    </Stack>
  );
}
