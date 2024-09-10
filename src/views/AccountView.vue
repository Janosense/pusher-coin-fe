<script setup>
import Queue from '@/components/Queue.vue';
import { useAuthenticationStore } from '@/stores/authentication.js';
import IconAccount from '@/components/icons/IconAccount.vue';
import Rooms from '@/components/Rooms.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authentication = useAuthenticationStore();
</script>

<template>
  <div class="view-holder">
    <div class="view-holder__content">
      <div class="content">
        <div class="wrapper content__wrapper">
          <div class="content__header">
            <h1 class="content__heading">Account</h1>
          </div>
          <div class="account">
            <div class="account__information">
              <div class="account__photo-holder">
                <IconAccount/>
              </div>
              <span class="account__nickname">Player 17</span>
            </div>
            <div class="account__finance">
              <div class="account__action-holder">
                <button class="account__action">
                  <span>95</span>
                  <span>Add balance</span>
                </button>
              </div>
              <div class="account__action-holder">
                <button class="account__action">
                  <span>1000</span>
                  <span>Get money</span>
                </button>
              </div>
            </div>
            <div class="account__form-holder">
              <form action="" class="form account__form">
                <div class="form__header">
                  <span class="form__title">Personal information</span>
                </div>
                <div class="form__item">
                  <label for="email" class="form__textfield-label"><sup>*</sup> Email</label>
                  <input type="email" id="email" name="email" class="form__textfield" required>
                  <span class="form__verification">Verify</span>
                </div>
                <div class="form__item">
                  <label for="phone" class="form__textfield-label"><sup>*</sup> Phone</label>
                  <input type="tel" id="phone" name="phone" class="form__textfield" required>
                  <span class="form__verification form__verification--active">Verified</span>
                </div>
                <button class="form__submit button button--yellow">Save</button>
              </form>
            </div>
            <div class="account__form-holder">
              <form action="" class="form account__form">
                <div class="form__header">
                  <span class="form__title">Password</span>
                </div>
                <div class="form__item">
                  <label for="password" class="form__textfield-label"><sup>*</sup> Password</label>
                  <input type="password" id="password" name="password" class="form__textfield"
                         required>
                </div>
                <div class="form__item">
                  <label for="password-repeat" class="form__textfield-label"><sup>*</sup> Password repeat</label>
                  <input type="password" id="password-repeat" name="password-repeat" class="form__textfield"
                         required>
                </div>
                <button class="form__submit button button--yellow">Save</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Queue v-if="!authentication.isUserLoggedIn"/>
    <Rooms v-else view="sidebar" @on-room-click="(roomId) => router.push({ name: 'room', params: { id: roomId } })"/>
  </div>
</template>

<style scoped>
.account__information {
  display: flex;
  align-items: center;
  column-gap: 20px;
  margin-bottom: 40px;
}

.account__photo-holder {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--yellow);

  & svg {
    display: block;
    width: 70%;
    height: 70%;
    fill: var(--purple-light)
  }
}

.account__nickname {
  font-size: 20px;

  @media (min-width: 1024px) {
    font-size: 24px;
  }

  @media (min-width: 1440px) {
    font-size: 28px;
  }
}

.account__form-holder {
  margin-bottom: 48px;
}

.account__form {
  width: auto;
  max-width: 460px;
  margin: 0;
}

.account__finance {
  display: flex;
  column-gap: 20px;
}

.account__action-holder {
  width: 50%;
  max-width: 180px;
  margin-bottom: 48px;

  @media (min-width: 1024px) {
    max-width: 220px;
  }

  &:first-child {
    .account__action {
      color: var(--yellow);

      &::before {
        background-color: var(--yellow);
      }

      &::after {
        top: calc(50% - 16px);
        border-top: 3px solid var(--yellow);
        border-left: 3px solid var(--yellow);
      }
    }
  }

  &:last-child {
    .account__action {
      color: var(--white);

      &::before {
        background-color: var(--white);
      }

      &::after {
        top: calc(50% - 2px);
        border-right: 3px solid var(--white);
        border-bottom: 3px solid var(--white);
      }
    }
  }
}

.account__action {
  position: relative;
  -webkit-appearance: none;
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
  padding: 16px 16px 16px 60px;
  box-sizing: border-box;
  font-family: "Oswald", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  font-size: 16px;
  text-decoration: none;
  text-align: left;
  line-height: 1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: var(--purple);

  &::before {
    content: '';
    position: absolute;
    top: calc(50% - 16px);
    left: 30px;
    display: block;
    width: 3px;
    height: 32px;
  }

  &::after {
    content: '';
    position: absolute;
    left: 22px;
    display: block;
    width: 16px;
    height: 16px;
    transform: rotate(45deg);
  }

  @media (min-width: 1024px) {
    padding: 20px 20px 20px 80px;

    &::before {
      left: 40px;
    }

    &::after {
      left: 32px;
    }
  }

  & span {
    display: block;

    &:first-child {
      margin-bottom: 4px;
      font-weight: 700;
      font-size: 24px;

      @media (min-width: 1024px) {
        font-size: 28px;
      }
    }

    &:last-child {
      font-weight: 300;
      font-size: 16px;

      @media (min-width: 1024px) {
        font-size: 18px;
      }
    }
  }
}
</style>
