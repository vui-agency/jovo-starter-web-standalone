import {
  Action,
  ActionType,
  AudioHelper,
  Client,
  ClientEvent,
  RequestType,
  SpeechRecognizerEvent,
  SpeechSynthesizerEvent,
  WebRequest,
  WebResponse,
} from "jovo-client-web";
import React, { useEffect, useState } from "react";
import { RecordButton } from "./RecordButton";

function App() {
  const [outputText, setOutputText] = useState(
    "Press the button below to get started"
  );

  const [inputText, setInputText] = useState("");
  const [theme, setTheme] = useState("");
  const [client, setClient] = useState<Client | undefined>();

  // eslint-disable-next-line no-undef
  const onSpeechRecognized = (event: SpeechRecognitionEvent) => {
    setInputText(AudioHelper.textFromSpeechRecognition(event));
  };

  const onRequest = (req: WebRequest) => {
    if (
      req.request.type === RequestType.Text ||
      req.request.type === RequestType.TranscribedText
    ) {
      setInputText(req.request.body.text || "");
    }
  };

  const onResponse = (res: WebResponse) => {
    if (res.context.request.asr?.text) {
      setInputText(res.context.request.asr.text);
    }
  };
  const onSpeechSpeak = (utterance: SpeechSynthesisUtterance) => {
    setOutputText(utterance.text);
  };
  const onAction = (action: Action) => {
    if (action.type === ActionType.Custom) {
      switch (action.command) {
        case "set-theme": {
          setTheme(action.value);
          break;
        }
        default:
      }
    }
  };

  useEffect(() => {
    const client = new Client("http://localhost:3000/webhook", {
      audioRecorder: {
        startDetection: {
          enabled: false,
        },
        silenceDetection: {
          enabled: false,
        },
      },
      speechRecognizer: {
        lang: "en",
        startDetection: {
          enabled: false,
        },
        silenceDetection: {
          enabled: false,
        },
      },
      repromptHandler: {
        enabled: false,
      },
    });

    client.$speechRecognizer.on(
      SpeechRecognizerEvent.SpeechRecognized,
      onSpeechRecognized
    );
    client.on(ClientEvent.Request, onRequest);
    client.on(ClientEvent.Response, onResponse);
    client.on(ClientEvent.Action, onAction);
    client.$speechSynthesizer.on(SpeechSynthesizerEvent.Speak, onSpeechSpeak);
    client.$speechSynthesizer.on(SpeechSynthesizerEvent.Speak, onSpeechSpeak);
    setClient(client);

    return () => {
      client.off(ClientEvent.Request, onRequest);
      client.off(ClientEvent.Response, onResponse);
      client.off(ClientEvent.Action, onAction);
      client.$speechRecognizer.off(
        SpeechRecognizerEvent.SpeechRecognized,
        onSpeechRecognized
      );
      client.$speechSynthesizer.off(
        SpeechSynthesizerEvent.Speak,
        onSpeechSpeak
      );
    };
  }, []);

  const recordButton = React.createRef<HTMLButtonElement>();
  const focus = () => {
    recordButton?.current?.focus();
  };

  useEffect(() => {
    focus();
  }, [recordButton]);

  return (
    <div className={theme === "dark" ? "mode-dark" : ""} onClick={focus}>
      <div
        id="app"
        className="flex flex-col w-screen h-screen bg-gray-300 dark:bg-gray-900"
      >
        {client?.$speechRecognizer.isAvailable ? (
          <div className="flex flex-col flex-grow justify-center items-center">
            <div className="flex flex-col flex-grow justify-center items-center">
              <div className="px-8">
                <p className="text-lg text-center text-gray-800 dark:text-gray-400">
                  {outputText}
                </p>
              </div>
            </div>
            <div className="flex flex-col flex-shrink-0 mt-auto justify-center items-center mb-16">
              <div className="mb-4 px-8">
                <p className="text-base text-center text-gray-800 dark:text-gray-400">
                  {inputText}
                </p>
              </div>
              <RecordButton ref={recordButton} client={client} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-grow justify-center items-center">
            <div className="px-8">
              <p className="text-lg text-center text-gray-800 dark:text-gray-400">
                This demo uses the Chrome Web Speech API, which unfortunately
                isn&apos;t supported in this browser.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
