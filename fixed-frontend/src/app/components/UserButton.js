const UserButton = ({username}) => {
    return ( 
        <div className="user-button">
            <span>{username}</span>
            <img src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png" alt="User Logo" />
        </div>
    );
}
 
export default UserButton;