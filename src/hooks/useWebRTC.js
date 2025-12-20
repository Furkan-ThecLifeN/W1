import { useEffect, useRef, useState } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = (socket, currentUser) => {
  const [activeVoiceChannel, setActiveVoiceChannel] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [serverIDRef, setServerIDRef] = useState(null);

  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedMic, setSelectedMic] = useState("default");
  const [selectedSpeaker, setSelectedSpeaker] = useState("default");

  const peersRef = useRef({});
  const localStreamRef = useRef(null);

  // ======================================================
  // 1️⃣ CİHAZLARI GETİR (İLK AÇILIŞ)
  // ======================================================
  useEffect(() => {
    let isMounted = true;

    const getDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const activeTrack = stream.getAudioTracks()[0];
        const activeDeviceId = activeTrack.getSettings().deviceId;

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!isMounted) return;

        const inputs = devices.filter((d) => d.kind === "audioinput");
        const outputs = devices.filter((d) => d.kind === "audiooutput");

        setInputDevices(inputs);
        setOutputDevices(outputs);

        // 🔥 GERÇEK DEFAULT MİKROFONU SET ET
        if (activeDeviceId) {
          setSelectedMic(activeDeviceId);
        }

        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        console.error("Cihaz alınamadı:", err);
      }
    };

    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);

    return () => {
      isMounted = false;
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, []);

  // ======================================================
  // 2️⃣ MİKROFON / KULAKLIK
  // ======================================================
  const switchMicrophone = async (deviceId) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId === "default" ? undefined : { exact: deviceId },
      },
    });

    const newTrack = stream.getAudioTracks()[0];

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = stream;
    setLocalStream(stream);

    Object.values(peersRef.current).forEach((peer) => {
      const sender = peer.getSenders().find((s) => s.track?.kind === "audio");
      sender?.replaceTrack(newTrack);
    });

    setSelectedMic(deviceId);
  };

  const switchSpeaker = (deviceId) => {
    setSelectedSpeaker(deviceId);
    document.querySelectorAll("audio").forEach((audio) => {
      if (typeof audio.setSinkId === "function") {
        audio.setSinkId(deviceId).catch(() => {});
      }
    });
  };

  const toggleMic = (isMuted) => {
    localStreamRef.current
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !isMuted));
  };

  const toggleDeaf = (isDeaf) => {
    toggleMic(isDeaf);
    Object.values(remoteStreams).forEach((stream) =>
      stream.getAudioTracks().forEach((track) => (track.enabled = !isDeaf))
    );
  };

  // ======================================================
  // 3️⃣ SES KANALINA GİR / ÇIK
  // ======================================================
  const joinVoiceChannel = async (serverId, channelId) => {
    try {
      setServerIDRef(serverId);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId:
            selectedMic !== "default" ? { exact: selectedMic } : undefined,
        },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      if (socket?.readyState === 1) {
        socket.send(
          JSON.stringify({
            type: "JOIN_VOICE",
            serverId,
            channelId,
          })
        );

        if (channelId !== "VOICE_MASTER") {
          setActiveVoiceChannel(channelId);
        }
      }
    } catch (err) {
      console.error("Voice join hatası:", err);
    }
  };

  const leaveVoiceChannel = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    Object.values(peersRef.current).forEach((p) => p.close());
    peersRef.current = {};
    setRemoteStreams({});

    if (socket?.readyState === 1) {
      socket.send(JSON.stringify({ type: "LEAVE_VOICE" }));
    }

    setActiveVoiceChannel(null);
  };

  // ======================================================
  // 4️⃣ WEBRTC PEER
  // ======================================================
  const createPeer = (targetUserId, initiateOffer = false) => {
    if (peersRef.current[targetUserId]) return peersRef.current[targetUserId];

    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[targetUserId] = peer;

    localStreamRef.current
      ?.getTracks()
      .forEach((track) => peer.addTrack(track, localStreamRef.current));

    peer.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.send(
          JSON.stringify({
            type: "WEBRTC_SIGNAL",
            targetUserId,
            signal: { type: "candidate", candidate: e.candidate },
          })
        );
      }
    };

    peer.ontrack = (e) => {
      const stream = e.streams[0];
      setRemoteStreams((prev) => ({ ...prev, [targetUserId]: stream }));

      let audio = document.getElementById(`audio-${targetUserId}`);
      if (!audio) {
        audio = document.createElement("audio");
        audio.id = `audio-${targetUserId}`;
        audio.autoplay = true;
        document.body.appendChild(audio);
      }
      audio.srcObject = stream;

      if (audio.setSinkId && selectedSpeaker !== "default") {
        audio.setSinkId(selectedSpeaker).catch(() => {});
      }
    };

    if (initiateOffer) {
      peer.createOffer().then((offer) => {
        peer.setLocalDescription(offer);
        socket.send(
          JSON.stringify({
            type: "WEBRTC_SIGNAL",
            targetUserId,
            signal: { type: "offer", sdp: offer },
          })
        );
      });
    }

    return peer;
  };

  const handleSignal = async ({ senderId, signal }) => {
    const peer = createPeer(senderId, false);

    if (signal.type === "offer") {
      await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.send(
        JSON.stringify({
          type: "WEBRTC_SIGNAL",
          targetUserId: senderId,
          signal: { type: "answer", sdp: answer },
        })
      );
    }

    if (signal.type === "answer") {
      await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    }

    if (signal.type === "candidate") {
      await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  };

  // ======================================================
  // 5️⃣ SOCKET MESAJLARI
  // ======================================================
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "VOICE_EXISTING_USERS") {
          msg.users.forEach((uid) => createPeer(uid, true));
        }

        if (msg.type === "WEBRTC_SIGNAL") {
          handleSignal(msg.data);
        }

        // 🔥 VOICEMASTER → OTOMATİK ODAYA TAŞI
        if (msg.type === "AUTO_JOIN_VOICE") {
          if (serverIDRef) {
            socket.send(
              JSON.stringify({
                type: "JOIN_VOICE",
                serverId: serverIDRef,
                channelId: msg.channelId,
              })
            );
            setActiveVoiceChannel(msg.channelId);
          }
        }
      } catch {}
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, serverIDRef, selectedSpeaker]);

  // ======================================================
  return {
    joinVoiceChannel,
    leaveVoiceChannel,
    activeVoiceChannel,
    localStream,
    remoteStreams,
    toggleMic,
    toggleDeaf,
    inputDevices,
    outputDevices,
    selectedMic,
    switchMicrophone,
    selectedSpeaker,
    switchSpeaker,
  };
};
