import {UserIcon} from './heroIcons'

const UserButton = ({username}) => {
    return ( 
        <div className="user-button">
            <span>{username}</span>
            <UserIcon/>
        </div>
    );
}
 
export default UserButton;