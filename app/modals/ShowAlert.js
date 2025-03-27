import Swal from "sweetalert2";
// css
import styles from "./styles/showalert.module.css"

const showAlert = (title, text, icon = "success", timer = 2000) => {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        timer: timer,
        showConfirmButton: false,
        customClass: {
            popup: styles.myPopup,
            content: styles.myContent,
            confirmButton: styles.myConfirmButton,
        }
    });
};

export default showAlert;