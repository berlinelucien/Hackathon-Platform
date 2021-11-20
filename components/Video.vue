<template>
  <div class="col-md-6 box">
    <div class="roomTitle">
      <span v-if="loading"> Loading... {{roomName}}</span>
      <span v-else-if="!loading && roomName"> Connected to {{roomName}}</span>
      <span v-else>Select a room to get started</span>
    </div>
    <div class="row remote_video_container">
      <div id="remoteTrack"></div>
    </div>
    <div class="spacing"></div>
    <div class="row">
      <div id="localTrack"></div>
    </div>
    <button type="submit"
      size="sm"
      style="top: 5px,
      left: 5px"
      @click="
        leaveRoomIfJoined();
      "
      class="btn btn-danger mb-2 Botton">End Meeting
    </button>
  </div>
</template>

<script>
// TODO: Update code to support twilio-video 2.x.x
import Twilio, { createLocalVideoTrack } from 'twilio-video';
import Axios from 'axios';
import generalMixin from '../mixins/general';

const jwt = require('jsonwebtoken');

export default {
  name: 'Video',
  mixins: [generalMixin],
  data() {
    return {
      loading: false,
      data: {},
      localTrack: false,
      remoteTrack: '',
      activeRoom: '',
      previewTracks: '',
      identity: '',
    };
  },
  props: ['username', 'roomName'],
  created() {
    this.createChat(this.roomName);
    // When a user is about to transition away from this page,
    // disconnect from the room, if joined.
    window.addEventListener('beforeunload', this.leaveRoomIfJoined);
  },
  methods: {
    async getAccessToken() {
      // TODO: Replace username with email
      return Axios.get(`${this.getEnvVariable('BACKEND')}/${this.getCurrentEnvironment()}/chats/token`, {
        headers: {
          Authorization: `Bearer ${jwt.sign({ email: this.username }, 'technica')}`,
        },
      });
    },
    showRoom(room) {
      this.roomName = room;
      this.createChat(this.roomName);
      window.addEventListener('beforeunload', this.leaveRoomIfJoined);
      this.startDate = new Date();
    },
    // Attach the Tracks to the DOM.
    attachTracks(tracks, container) {
      tracks.forEach((track) => {
        container.appendChild(track.attach());
      });
    },
    // Attach the Participant's Tracks to the DOM.
    attachParticipantTracks(participant, container) {
      const tracks = Array.from(participant.tracks.values());
      this.attachTracks(tracks, container);
    },
    // Detach the Tracks from the DOM.
    detachTracks(tracks) {
      tracks.forEach((track) => {
        track.detach().forEach((detachedElement) => {
          detachedElement.remove();
        });
      });
    },
    // Detach the Participant's Tracks from the DOM.
    detachParticipantTracks(participant) {
      const tracks = Array.from(participant.tracks.values());
      this.detachTracks(tracks);
    },
    // Leave Room.
    leaveRoomIfJoined() {
      if (this.activeRoom) {
        this.activeRoom.disconnect();
        Twilio.disconnect();
        console.log('Disconnected from room');
      }
    },
    // TODO: Add mute video / audio functionality following https://medium.com/teamarimac/twilio-programmable-video-chat-with-laravel-and-vue-js-a485a2d31f5d
    // Mute audio of video chat
    mute_audio() {
      this.activeRoom.localParticipant.audioTracks.forEach((audioTrack) => {
        audioTrack.disable();
      });
      this.microphone = false;
    },
    // Unmute audio of video chat
    unmute_audio() {
      this.activeRoom.localParticipant.audioTracks.forEach((audioTrack) => {
        audioTrack.enable();
      });
      this.microphone = true;
    },
    // Mute video
    mute_video() {
      this.activeRoom.localParticipant.videoTracks.forEach((videoTrack) => {
        videoTrack.disable();
      });
      this.camera = false;
    },
    // Unmute video
    unmute_video() {
      this.activeRoom.localParticipant.videoTracks.forEach((videoTrack) => {
        videoTrack.enable();
      });
      this.camera = true;
    },
    createChat(roomName) {
      this.loading = true;
      const VueThis = this;
      this.getAccessToken().then((response) => {
        VueThis.roomName = null;
        const { token } = response.data;
        const connectOptions = {
          name: roomName,
          // logLevel: 'debug',
          audio: true,
          video: { width: 600 },
        };
          // before a user enters a new room,
          // disconnect the user from they joined already
        this.leaveRoomIfJoined();

        // remove any remote track when joining a new room
        document.getElementById('remoteTrack').innerHTML = '';
        Twilio.connect(token, connectOptions).then((room) => {
          // set active toom
          VueThis.activeRoom = room;
          VueThis.roomName = roomName;
          VueThis.loading = false;
          console.log('Connected to room');

          // Attach the Tracks of the Room's Participants.
          room.participants.forEach((participant) => {
            console.log(participant);
            const previewContainer = document.getElementById('remoteTrack');
            VueThis.attachParticipantTracks(participant, previewContainer);
          });
          // When a Participant joins the Room, log the event.
          room.on('participantConnected', (participant) => {
            console.log(`Joining: '${participant.identity}'`);
          });
          // When a Participant adds a Track, attach it to the DOM.
          room.on('trackAdded', (track, participant) => {
            console.log(`${participant.identity} added track: ${track.kind}`);
            const previewContainer = document.getElementById('remoteTrack');
            VueThis.attachTracks([track], previewContainer);
          });
          // When a Participant removes a Track, detach it from the DOM.
          room.on('trackRemoved', (track, participant) => {
            console.log(`${participant.identity} removed track: ${track.kind}`);
            VueThis.detachTracks([track]);
          });
          // When a Participant leaves the Room, detach its Tracks.
          room.on('participantDisconnected', (participant) => {
            console.log(`Participant '${participant.identity}' left the room`);
            VueThis.detachParticipantTracks(participant);
          });
          // if local preview is not active, create it
          if (!VueThis.localTrack) {
            createLocalVideoTrack().then((track) => {
              const localMediaContainer = document.getElementById('localTrack');
              localMediaContainer.appendChild(track.attach());
              VueThis.localTrack = true;
            });
          }
        });
      });
    },
  },
};
</script>

<style >
  .remote_video_container {
    left: 0;
    margin: 0;
    border: 1px solid rgb(124, 129, 124);
  }
  #localTrack video {
      border: 3px solid rgb(124, 129, 124);
      margin: 0px;
      max-width: 50% !important;
      background-repeat: no-repeat;
  }
  .spacing {
    padding: 20px;
    width: 100%;
  }
  .roomTitle {
      border: 1px solid rgb(124, 129, 124);
      padding: 4px;
      color: dodgerblue;
  }
</style>
