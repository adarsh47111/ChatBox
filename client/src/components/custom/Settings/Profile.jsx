import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import illustration from "../../../assets/social.gif";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { UpdateUserAvatar, UpdateUserInfo } from "@/redux/slices/auth";
import { uploadFile } from "@/utils/FireBase";
import { toast } from "sonner";
import LoaderIndicator from "../LoaderIndicator";

const Profile = () => {
  const { username, avatar, about } = useSelector((state) => state.auth);
  const [user_name, setUser_name] = useState(username);
  const [user_about, setUser_about] = useState(about);
  const [user_avatar, setUser_avatar] = useState(avatar);
  const [new_avatar, setNew_avatar] = useState(null);
  const [new_avatarUrl, setNew_avatarUrl] = useState(null);
  const [saveBtn, setSaveBtn] = useState(false);
  const { user_id } = useSelector((state) => state.auth);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setNew_avatar(null);
    setUser_avatar(avatar);
  }, [avatar]);

  useEffect(() => {
    if (new_avatar !== null) {
      var reader = new FileReader();
      reader.onload = function () {
        setNew_avatarUrl(reader.result);
        // console.log(file);
      };
      reader.readAsDataURL(new_avatar);
    }
  }, [new_avatar]);

  const handleSaveAvatar = async () => {
    setAwaitingResponse(true);
    const URL = await uploadFile({
      path: "avatar",
      fileName: user_id,
      file: new_avatar,
    });

    dispatch(
      UpdateUserAvatar({
        avatarUrl: URL,
      })
    );
    setAwaitingResponse(false);
  };

  return (
    <div className="flex-1 flex h-screen px-24 py-10">
      <div className="w-[50%]">
        <div className="h-16 text-3xl text-muted-foreground">My Profile</div>
        <div className="mt-16 space-y-4">
          <p>Your Profile Photo</p>
          <div className="flex items-center space-x-10">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={new_avatar === null ? user_avatar : new_avatarUrl}
              />
              <AvatarFallback>Avatar</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-between space-y-2 h-full text-sm">
              {new_avatar === null ? (
                <>
                  <label htmlFor="avatar">
                    <Button
                      onClick={() => document.getElementById("avatar").click()}
                    >
                      Change Photo
                    </Button>
                  </label>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      setNew_avatar(e.target.files[0]);
                    }}
                  />
                </>
              ) : (
                <Button onClick={handleSaveAvatar} disabled={awaitingResponse}>
                  Save Photo {awaitingResponse && <LoaderIndicator />}
                </Button>
              )}
              {new_avatar === null ? (
                <Button
                  variant="outline"
                  className="space-x-2"
                  onClick={() => dispatch(UpdateUserAvatar({ avatarUrl: "" }))}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setNew_avatar(null);
                    setNew_avatarUrl(null);
                  }}
                  disabled={awaitingResponse}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="w-full mt-20 space-y-4">
          <div className=" space-y-2">
            <span className=" text-sm text-muted-foreground">Username</span>
            <Input
              placeholder="Username"
              value={user_name}
              onChange={(e) => {
                setUser_name(e.target.value);
                if (saveBtn === false) setSaveBtn(true);
              }}
            />
          </div>
          <div>
            <span className=" text-sm text-muted-foreground">About</span>
            <Textarea
              className="h-32 w-full"
              placeholder="Tell about something yourself..."
              value={user_about}
              onChange={(e) => {
                setUser_about(e.target.value);
                if (saveBtn === false) setSaveBtn(true);
              }}
            />
          </div>
          {saveBtn && (
            <Button
              className="w-28 mx-auto"
              onClick={() => {
                if (user_about.length > 100) {
                  toast("Max Length 100");
                  return;
                }
                dispatch(
                  UpdateUserInfo({ username: user_name, about: user_about })
                );
                setSaveBtn(false);
              }}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>
      <img className="opacity-35 my-auto" src={illustration} alt="" />
    </div>
  );
};

export default Profile;
