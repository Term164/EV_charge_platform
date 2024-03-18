import express from "express";
import register from "../services/register";
import asyncHandler from "express-async-handler";
import authService from "../services/authService";
import path from "path";

const router = express.Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const response = await authService.login(req.body);
    res.status(response.status).send(response);
  }),
);

router.post(
  "/register/step1",
  asyncHandler(async (req, res) => {
    const response = await register.firstStep(req.body);
    res.status(response.status).send(response);
  }),
);

router.get(
  "/register/step2/:id/:token",
  asyncHandler(async (req, res) => {
    const response = await register.secondStep(req.params);
    if (response.status === 200) {
      console.log(__dirname);
      res.sendFile(
        path.join(
          "/home/ec2-user/EV_charge_platform/Backend/" +
            "/src/assets/registration.html",
        ),
      );
    } else {
      res.status(response.status).send(response);
    }
  }),
);

router.post("/logout", (_req, res) => {
  res.send("Logout user from the platform");
});

router.post(
  "/forgotPassword",
  asyncHandler(async (req, res) => {
    const response = await authService.forgotPassword(req.body);
    res.status(response.status).send(response);
  }),
);

router.post(
  "/confirmValidationCode",
  asyncHandler(async (req, res) => {
    const response = await authService.confirmVerificationCode(req.body);
    res.status(response?.status).send(response);
  }),
);

router.post(
  "/resetPassword",
  asyncHandler(async (req, res) => {
    const response = await authService.resetPassword(req.body);
    res.status(response?.status).send(response);
  }),
);

export default router;
