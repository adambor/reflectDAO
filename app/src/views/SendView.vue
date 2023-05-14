<template>
    <Header />
    <div class="send-section">
       <div class="main-title">
         <h1>Send your tokens</h1>
       </div>
       <div class="body-content">
         <div class="input">
            <p>Token amount</p>
            <input v-model="tokenAmount" type="number">
         </div>
         <div class="input">
            <p>UTXO Hash</p>
            <input v-model="hash" type="text">
         </div>
         <button @click="send()">Send</button>
       </div>
    </div>
</template>


<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Header from "@/components/Header.vue";
import { StaticEVMWallet } from "@/StaticEVMWallet";

@Options({
  data: function () {
    return {
      tokenAmount: 0,
      hash: null
    };
  },
  components: {
    Header
  },
  methods: {
    send: async function () {
      let stateTransition = await StaticEVMWallet.tokenManager.createSendStateTransition(this.hash, this.tokenAmount);
      console.log( await StaticEVMWallet.wallet.btcWallet.commitStateTransition(stateTransition) );
    }
  }
})
export default class SendView extends Vue {}
</script>

<style lang="scss" scoped>
  .send-section {
      max-width:1000px;
      margin:0 auto;
      overflow:auto;
      padding:1rem;

      .main-title {
        display:flex;
        justify-content: space-between;
        align-items: center;
        width:100%;
        margin-bottom:1rem;
        color:#fff;
      }

      button {
        padding: .5rem 1rem;
        background-color:transparent;
        border:0;
        border:2px solid rgba(255,255,255,.1);
        border-radius:10px;
        box-sizing: border-box;
        color:rgba(255,255,255,.8);
        cursor:pointer;
        margin-top:1.5rem;
        
        &:hover {
          background-color:rgba(255,255,255,.02);
        }
      }

      .body-content {
        text-align:left;
        .input {
          
          &:not(:last-of-type) {
            margin-bottom:1rem;
          }
        
          p {
            font-size:1rem;
            color:rgba(255,255,255,.6);
          }

          input {
            width:300px;
            height:40px;
            background-color:transparent;
            border-radius:5px;
            border: 1px solid rgba(255,255,255,.05);
            outline: none;
            padding: 0 1rem;
            color:#fff;

            &:hover {
              border: 1px solid rgba(255,255,255,.1);
            }
              
          }

        }
      }

  }
</style>