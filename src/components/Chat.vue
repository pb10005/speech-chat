<template>
  <div class="chat-area">
    <section id="message-area">
      <v-text-field label="名前" v-model="sender" required />
      <v-list three-line>
        <template v-for="(item, index) in chat_messages">
          <v-divider
            v-if="index > 0"
            :key="index"
            :inset="item.inset"
          ></v-divider>
          <v-list-item :key="item.msg_id">
            <v-list-item-content>
              <v-list-item-title v-text="item.sender"></v-list-item-title>
              <v-list-item-title v-text="item.message"></v-list-item-title>
              <v-list-item-subtitle>{{
                item.send_datetime | datetimeFormatter
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </section>
    <v-content id="send-form">
      <form class="input-group" @submit.prevent="send">
        <v-text-field solo v-model="message" label="メッセージ" required>
          <input class="input-addon" slot="append" type="submit" value="送信" />
        </v-text-field>
      </form>
    </v-content>
  </div>
</template>

<script>
import gql from "graphql-tag";
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  filters: {
    datetimeFormatter(dateString) {
      let date = new Date(dateString);
      return `${date.getFullYear()}/${date.getMonth() +
        1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
  },
  computed: {},
  apollo: {
    chat_messages: {
      query() {
        return gql`
          query {
            chat_messages(where: {thread_id: {_eq: ${this.$route.params.id}}}, order_by: {send_datetime: desc}) {
              message
              msg_id
              send_datetime
              sender
            }
          }
        `;
      },
      subscribeToMore: {
        document() {
          return gql`
            subscription {
              chat_messages(where: {thread_id: {_eq: ${this.$route.params.id}}}, order_by: {send_datetime: desc}) {
                message
                msg_id
                send_datetime
                sender
              }
            }
          `;
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!prev) return subscriptionData.data;
          const prevIds = prev.chat_messages.map(x => x.msg_id);
          const updates = subscriptionData.data.chat_messages.filter(
            x => !prevIds.includes(x.msg_id)
          );
          if (updates.length > 0) {
            let u = new SpeechSynthesisUtterance(
              updates[0].sender + "さんのメッセージ。" + updates[0].message
            );
            u.lang = "ja";
            speechSynthesis.speak(u);
          }
          return subscriptionData.data;
        }
      }
    }
  },
  data() {
    return {
      chat_messages: [],
      sender: "",
      message: ""
    };
  },
  methods: {
    send() {
      this.$apollo.mutate({
        mutation: gql`mutation SendMessage {
          insert_chat_messages(objects: {message: "${this.message}", sender: "${this.sender}", thread_id: "${this.$route.params.id}"}) {
            returning {
              message
              msg_id
              send_datetime
              sender
            }
          }
        }
        `
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

#send-form {
  position: fixed;
  bottom: 0;
  height: 50px;
  width: 100%;
  background: #f0f0f0;
}

.chat-area {
  margin-bottom: 100px;
}
</style>
