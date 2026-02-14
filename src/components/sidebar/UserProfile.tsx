export interface UserProfileProps {
    name: string;
    avatarUrl: string;
}

export const UserProfile = ({ name, avatarUrl }: { name: string, avatarUrl: string }) => {
    return (
        <div className="user-profile">
            <img src={avatarUrl || "https://via.placeholder.com/32"} alt={name} className="user-profile__avatar" />
            <div className="user-profile__info">
                <span className="user-profile__name">{name}</span>
            </div>
        </div>
    );
};