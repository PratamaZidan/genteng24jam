import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification, unsubscribePushNotification 
} from '../data/genteng24jam-api';

export function isNotificationAvailable() {
  return 'Notification' in window;
}
 
export function isNotificationGranted() {
  return Notification.permission === 'granted';
}
 
export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }
 
  if (isNotificationGranted()) {
    return true;
  }
 
  const status = await Notification.requestPermission();
 
  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }
 
  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }
 
  return true;
}
 
export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}
 
export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export async function subscribe(token) {
  if (!(await requestNotificationPermission())) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };

  try {
    const pushSubscription =
      await registration.pushManager.subscribe(subscribeOptions);
    const response = await subscribePushNotification(pushSubscription, token);

    if (response.error) {
      alert(response.message);
      return false;
    }

    console.log("Berhasil subscribe notifikasi!");
    alert("Berhasil subscribe notifikasi!");
    return true;
  } catch (err) {
    console.error("Gagal subscribe:", err);
    alert("Gagal subscribe.");
    return false;
  }
}

export async function unsubscribe(token) {
  const registration = await navigator.serviceWorker.ready;
  const pushSubscription = await registration.pushManager.getSubscription();

  if (!pushSubscription) {
    alert("Belum subscribe.");
    return false;
  }

  try {
    const response = await unsubscribePushNotification(
      pushSubscription.endpoint,
      token,
    );
    console.log("Unsubscribe endpoint:", pushSubscription.endpoint);
    await pushSubscription.unsubscribe();

    if (response.error) {
      alert(response.message);
      return false;
    }

    console.log("Berhasil unsubscribe notifikasi!");
    alert("Berhasil unsubscribe notifikasi!");
    return true;
  } catch (err) {
    console.error("Gagal unsubscribe:", err);
    alert("Gagal unsubscribe.");
    return false;
  }
}

export async function checkSubscriptionStatus() {
  const registration = await navigator.serviceWorker.ready;
  const pushSubscription = await registration.pushManager.getSubscription();

  return !!pushSubscription;
}
