import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { bake_cookie } from 'sfcookies';
import { app } from "../Firebase";

const SignUp = async (email, password) => {
    const auth = getAuth(app);
    await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
            alert("Account registered!");
            bake_cookie('user', user.uid);
        }
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
    });
}

export default SignUp;