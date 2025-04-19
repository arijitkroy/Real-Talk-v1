import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { bake_cookie } from 'sfcookies';

const SignIn = async (email, password) => {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        bake_cookie('user', user.uid);
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    });
}

export default SignIn;