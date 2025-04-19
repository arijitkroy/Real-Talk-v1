import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { bake_cookie } from 'sfcookies';
import { app } from "../Firebase";

const SignIn = async (email, password) => {
    const auth = getAuth(app);
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