import { Client, RequestType, SpeechRecognizerEvent } from "jovo-client-web";
import React, { forwardRef, useEffect, useState } from "react";
import { Mic, Play } from "react-feather";

export interface RecordButtonProps {
  client: Client;
}

export type Ref = HTMLButtonElement;
export const RecordButton = forwardRef<Ref, RecordButtonProps>(
  function RecordButton(props: RecordButtonProps, ref) {
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
      props.client.$speechRecognizer.on(SpeechRecognizerEvent.Start, () =>
        setIsRecording(true)
      );
      props.client.$speechRecognizer.on(SpeechRecognizerEvent.End, () =>
        setIsRecording(false)
      );
    }, [props.client]);

    const onClick = async () => {
      if (!props.client.isInitialized) {
        await props.client.initialize();
        await props.client.createRequest({ type: RequestType.Launch }).send();
      }
    };

    const onStart = async (event: React.MouseEvent | React.TouchEvent) => {
      if (props.client.isInitialized) {
        event.preventDefault();
      }
      if (props.client.isRecordingInput || !props.client.isInitialized) {
        return;
      }
      await props.client.startInputRecording();
    };

    const onMouseUp = () => {
      props.client.stopInputRecording();
    };

    const onKeyDown = async (event: React.KeyboardEvent) => {
      if (event.key === " ") {
        await props.client.startInputRecording();
      }
    };

    const onKeyUp = async (event: React.KeyboardEvent) => {
      if (event.key === " ") {
        props.client.stopInputRecording();
      }
    };

    const extraClass = isRecording
      ? "shadow-inner animate-ripple dark:animate-ripple-dark"
      : "";

    return (
      <button
        className={`bg-gray-100 dark:bg-gray-800 rounded-full p-8 focus:outline-none shadow-2xl ${extraClass}`}
        onMouseDown={onStart}
        onTouchStart={onStart}
        onClick={onClick}
        onMouseUp={onMouseUp}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        ref={ref}
      >
        {!props.client.isInitialized ? (
          <Play className="text-gray-700" />
        ) : (
          <Mic className="text-gray-700 dark:text-gray-300" />
        )}
      </button>
    );
  }
);
