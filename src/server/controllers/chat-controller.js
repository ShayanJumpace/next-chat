import userModel from "../models/user-model.ts";
import roomModel from "../models/room-model.ts";

export async function logIn(req, res, next) {
  try {
    const { userName } = req.body;

    let userData = await userModel.findOne({ userName });

    if (!userData) {
      userData = await userModel.create({ userName });
    }

    return res.status(200).json({
      message: `User ${userName} Logged In.`,
      data: {
        userData,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const usersData = await userModel.find({});

    return res.status(200).json({
      message: `Got All Users.`,
      data: {
        usersData,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function joinRoom(req, res, next) {
  try {
    const { senderUserName, receiverUserName } = req.body;

    const senderUserData = await userModel
      .findOne({
        userName: senderUserName,
      })
      .populate({
        path: "userRooms",
        populate: {
          path: "users",
          select: "userName",
        },
      });
    const receiverUserData = await userModel.findOne({
      userName: receiverUserName,
    });

    if (senderUserData !== null && receiverUserData !== null) {
      let roomData = senderUserData.userRooms.find((userRoom) => {
        return (
          (userRoom.users[0].userName === senderUserData.userName &&
            userRoom.users[1].userName === receiverUserData.userName) ||
          (userRoom.users[1].userName === senderUserData.userName &&
            userRoom.users[0].userName === receiverUserData.userName)
        );
      });

      if (!roomData) {
        roomData = await roomModel.create({
          users: [senderUserData._id, receiverUserData._id],
        });

        await userModel.updateOne(
          { userName: senderUserName },
          {
            userRooms: [...senderUserData.userRooms, roomData._id],
          }
        );

        await userModel.updateOne(
          { userName: receiverUserName },
          {
            userRooms: [...receiverUserData.userRooms, roomData._id],
          }
        );
      }

      return res.status(200).json({
        message: `Room Joint.`,
        data: { roomData },
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getRoom(req, res, next) {
  try {
    const { roomId } = req.body;

    const roomData = await roomModel
      .findOne({
        _id: roomId,
      })
      .populate({ path: "users", select: "userName" })
      .populate({ path: "messages", select: "sender text" });

    return res.status(200).json({
      message: `Got Room.`,
      data: { roomData },
    });
  } catch (error) {
    next(error);
  }
}
