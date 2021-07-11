<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-sm">
        <div class="col">
          <q-input
            bottom-slots
            class="new-qweet"
            v-model="newQweetContent"
            placeholder="What's happening"
            counter
            maxlength="280"
            autogrow
          >
            <template v-slot:before>
              <q-avatar size="xl">
                <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <div class="col col-shrink">
          <q-btn
            @click="addNewQweet"
            :disable="!newQweetContent"
            class="q-mb-lg"
            unelevated
            rounded
            color="primary"
            label="Qweet"
            no-caps
          />
        </div>
      </div>
      <q-separator class="divider" size="10px" color="grey-2" />

      <q-list
        separator
        v-for="qweet in qweets"
        :key="qweet.id"
        class="qweet q-py-md"
      >
        <q-list-header
          class="header text-grey-7"
          v-if="qweet.baseQweetId != null"
        >
          <q-icon class="fas fa-retweet" size="17px" /> reqweeted
        </q-list-header>

        <q-item>
          <q-item-section avatar top>
            <q-avatar size="xl">
              <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-subtitle1">
              <strong>Loren Moree</strong>
              <span class="text-grey-7">
                @loren.moree <br class="lt-md" />
                &bull;{{ relativeDate(qweet.date) }}
              </span>
            </q-item-label>
            <q-item-label class="qweet-content text-body1">
              {{ qweet.content }}
            </q-item-label>
            <div class="qweet-icons row justify-between q-mt-sm">
              <q-btn size="sm" icon="far fa-comment" flat round color="grey" />

              <q-btn
                size="sm"
                icon="fas fa-retweet"
                flat
                round
                :color="qweet.reqweet ? 'positive' : 'grey'"
              >
                <q-menu anchor="center middle" self="center middle">
                  <q-list>
                    <q-item clickable v-close-popup>
                      <q-item-section @click="reqweeted(qweet)"
                        ><q-icon class="fas fa-retweet" />
                        <span v-if="qweet.reqweet">Undo </span
                        ><span>Reqweet</span></q-item-section
                      >
                    </q-item>
                    <q-item clickable v-close-popup>
                      <q-item-section
                        ><i class="fas fa-pen"></i>Quote Qweet</q-item-section
                      >
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>

              <q-btn
                @click="toggleLiked(qweet)"
                size="sm"
                :icon="qweet.liked ? 'fas fa-heart' : 'far fa-heart'"
                flat
                round
                :color="qweet.liked ? 'pink' : 'grey'"
              />

              <q-btn
                class="deletebtn"
                @click="deletebtn(qweet)"
                size="sm"
                icon="fas fa-trash"
                flat
                round
                color="grey"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import db from "src/boot/firebase";
import { defineComponent } from "vue";
import { formatDistance } from "date-fns";

export default defineComponent({
  name: "PageHome",
  data() {
    return {
      newQweetContent: "",
      qweets: [],
    };
  },
  methods: {
    relativeDate(value) {
      return formatDistance(value, new Date());
    },
    addNewQweet() {
      let newQweet = {
        content: this.newQweetContent,
        date: Date.now(),
        liked: false,
        reqweet: false,
        baseQweetId: null,
        subQweetId: null,
      };
      this.addQweet(newQweet);
      this.newQweetContent = "";
    },
    addQweet(qweet) {
      db.collection("qweets").add(qweet);
    },
    deletebtn(qweet) {
      if (qweet.baseQweetId != null) {
        db.collection("qweets").doc(qweet.baseQweetId).update({
          reqweet: false,
          baseQweetId: null,
          subQweetId: null,
        });
      }
      this.deleteQweet(qweet);
    },
    deleteQweet(qweet) {
      db.collection("qweets").doc(qweet.id).delete();
    },
    toggleLiked(qweet) {
      if (qweet.baseQweetId != null) {
        db.collection("qweets").doc(qweet.baseQweetId).update({
          liked: !qweet.liked,
        });
      }
      db.collection("qweets")
        .doc(qweet.id)
        .update({
          liked: !qweet.liked,
        })
        .then(() => {
          console.log("Document successfully updated!");
        })
        .catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
    },
    reqweeted(qweet) {
      if (!qweet.reqweet) {
        this.copyqweet(qweet);
        this.toggleReqweet(qweet);

        console.log(this.qweets);
      } else {
        //sub Qweet unreqweet
        if (qweet.baseQweetId != null) {
          db.collection("qweets").doc(qweet.baseQweetId).update({
            reqweet: false,
            baseQweetId: null,
            subQweetId: null,
          });
          this.deleteQweet(qweet);
        } //base Qweet unreqweet
        else {
          console.log("sub:", qweet.subQweetId);
          console.log("id:", qweet.id);

          db.collection("qweets").doc(qweet.subQweetId).delete();

          db.collection("qweets")
            .doc(qweet.id)
            .update({
              reqweet: false,
            })
            .then(() => {
              // console.log("Document successfully updated!");
            });
        }
      }
    },
    copyqweet(qweet) {
      let newQweet = {
        content: qweet.content,
        date: qweet.date,
        liked: qweet.liked,
        reqweet: true,
        baseQweetId: qweet.id,
        subQweetId: null,
      };
      this.addQweet(newQweet);
    },
    toggleReqweet(qweet) {
      db.collection("qweets").doc(qweet.id).update({
        reqweet: !qweet.reqweet,
      });
    },
  },
  mounted() {
    db.collection("qweets")
      .orderBy("date")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          let qweetChange = change.doc.data();
          qweetChange.id = change.doc.id;
          if (change.type === "added") {
            this.qweets.unshift(qweetChange);
          }
          if (change.type === "modified") {
            // console.log("Modified qweet: ", qweetChange);
            let index = this.qweets.findIndex(
              (qweet) => qweet.id === qweetChange.id
            );
            Object.assign(this.qweets[index], qweetChange);
          }
          if (change.type === "removed") {
            //   console.log("Removed qweet: ", qweetChange);
            let index = this.qweets.findIndex(
              (qweet) => qweet.id === qweetChange.id
            );
            this.qweets.splice(index, 1);
          }
        });
      });
  },
});
</script>
<style lang="sass">
.new-qweet
textarea
  font-size: 19px
  line-height: 1.4 !important

.divider
  border-top: 1px solid
  border-bottom: 1px solid
  border-color: $grey-4
.qweet:not(:first-child)
  border-top: 1px solid rgba(0, 0, 0, 0.12)
.qweet-content
  white-space: pre-line

.qweet-icons
  margin-left: -5px

.header
  margin-left: 60px
</style>