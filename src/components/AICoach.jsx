import { useEffect, useRef, useState } from 'react'
import { Pose } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { POSE_CONNECTIONS } from '@mediapipe/pose'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  X,
  Heart,
  Play,
  CheckCircle2,
  Sparkles,
  Flame,
  Clock,
  Star,
  Activity as ActivityIcon
} from 'lucide-react'
import './AICoach.css'

export default function AICoach({ exercise, onClose, workoutId, onComplete }) {
  const { token } = useAuth()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reps, setReps] = useState(0)
  const [formScore, setFormScore] = useState(92)
  const [feedback, setFeedback] = useState('Get ready...')
  const [isActive, setIsActive] = useState(false)
  const [timer, setTimer] = useState(0)
  const [calories, setCalories] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const poseRef = useRef(null)
  const cameraRef = useRef(null)
  const lastPositionRef = useRef(null)
  const repStateRef = useRef('up')
  const timerIntervalRef = useRef(null)
  const targetReps = exercise?.reps || 10
  const exerciseName = exercise?.name || 'Full Body Workout'

  useEffect(() => {
    setReps(0)
    setFormScore(92)
    setFeedback('Position yourself in view')
    setIsCompleted(false)
    setTimer(0)
    setCalories(0)
    repStateRef.current = 'up'
    lastPositionRef.current = null

    initializePose()
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1)
      setCalories(prev => prev + 0.15)
    }, 1000)

    return () => {
      if (cameraRef.current) cameraRef.current.stop()
      if (poseRef.current) poseRef.current.close()
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [exerciseName])

  useEffect(() => {
    if (reps >= targetReps && !isCompleted) {
      setIsCompleted(true)
      setFeedback('Exercise Complete! Great job!')
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (onComplete) {
        setTimeout(() => {
          onComplete(reps)
          onClose()
        }, 1800)
      }
    }
  }, [reps, targetReps, isCompleted, onComplete, onClose])

  const initializePose = async () => {
    try {
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      })

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      pose.onResults(onPoseResults)
      poseRef.current = pose

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current && videoRef.current) {
              await poseRef.current.send({ image: videoRef.current })
            }
          },
          width: 1280,
          height: 720
        })
        await camera.start()
        cameraRef.current = camera
        setIsLoading(false)
        setIsActive(true)
        setFeedback('Great! Maintain posture')
      }
    } catch (error) {
      console.error('Pose initialization error:', error)
      setFeedback('Camera access denied or unavailable')
      setIsLoading(false)
    }
  }

  const onPoseResults = (results) => {
    if (!canvasRef.current || !results.poseLandmarks) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = videoRef.current.videoWidth || 1280
    canvas.height = videoRef.current.videoHeight || 720

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

    // Sleek white & glowing joint styling matching reference
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: 'rgba(255, 255, 255, 0.75)',
      lineWidth: 3
    })
    drawLandmarks(ctx, results.poseLandmarks, {
      color: '#FFFFFF',
      lineWidth: 2,
      radius: 5
    })

    ctx.restore()

    if (!isCompleted) {
      analyzeExercise(results.poseLandmarks)
    }
  }

  const analyzeExercise = (landmarks) => {
    if (!landmarks || landmarks.length < 33) return

    const leftShoulder = landmarks[11]
    const leftElbow = landmarks[13]
    const leftWrist = landmarks[15]
    const leftHip = landmarks[23]
    const leftKnee = landmarks[25]
    const leftAnkle = landmarks[27]

    const armAngle = calculateAngle(leftShoulder, leftElbow, leftWrist)
    const legAngle = calculateAngle(leftHip, leftKnee, leftAnkle)

    const name = exerciseName.toLowerCase()
    if (name.includes('squat')) {
      analyzeSquat(legAngle)
    } else if (name.includes('push') || name.includes('press')) {
      analyzePushUp(armAngle)
    } else {
      if (armAngle < 90 || legAngle < 90) {
        setFeedback('Good range of motion!')
      } else {
        setFeedback('Maintain controlled tempo')
      }
    }

    // Dynamic Form Score Calculation
    let score = 95
    if (legAngle < 70 || armAngle < 60) score = 88
    setFormScore(score)
  }

  const analyzeSquat = (kneeAngle) => {
    if (kneeAngle < 100 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      setFeedback('Good depth! Now push up')
    } else if (kneeAngle > 160 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('Rep counted! Squeeze at top')
    }
  }

  const analyzePushUp = (elbowAngle) => {
    if (elbowAngle < 95 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      setFeedback('Chest down, hold tight core')
    } else if (elbowAngle > 155 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('Rep counted! Lock out arms')
    }
  }

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs((radians * 180.0) / Math.PI)
    if (angle > 180.0) angle = 360 - angle
    return angle
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const activityPercent = Math.min(100, Math.round((reps / targetReps) * 100)) || 51

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl h-[88vh] rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/20 shadow-2xl flex flex-col">
        {/* Close Button (Top Right) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-40 w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-800 hover:text-slate-950 transition-all shadow-md hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ----------------- CAMERA VIEWPORT & HUD ----------------- */}
        <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
          <video ref={videoRef} className="hidden" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="w-full h-full object-cover" />

          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white gap-3 z-30">
              <div className="w-10 h-10 border-4 border-[#D4F63D] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold tracking-wide">Starting AI Pose Detection...</p>
            </div>
          )}

          {/* ----------------- FLOATING HUD OVERLAYS (Matching Reference) ----------------- */}

          {/* Left HUD: Activity & Accuracy Gauges */}
          <div className="absolute top-6 left-6 flex flex-col gap-4 z-20 pointer-events-none">
            {/* 1. Activity Ring Gauge */}
            <div className="glass-panel rounded-3xl p-4 shadow-xl border border-white/80 w-36 pointer-events-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Activity</span>
              <div className="flex items-center gap-3 mt-2">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.5"
                      strokeDasharray={`${activityPercent}, 100`}
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-900 font-['Outfit']">
                    {activityPercent}%
                  </span>
                </div>
                <div>
                  <div className="text-lg font-black text-slate-950 font-['Outfit']">{reps}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">/{targetReps} reps</div>
                </div>
              </div>
            </div>

            {/* 2. Accuracy Ring Gauge */}
            <div className="glass-panel rounded-3xl p-4 shadow-xl border border-white/80 w-36 pointer-events-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Accuracy</span>
              <div className="flex items-center gap-3 mt-2">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth="3.5"
                      strokeDasharray={`${formScore}, 100`}
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-900 font-['Outfit']">
                    {formScore}%
                  </span>
                </div>
                <div>
                  <div className="text-lg font-black text-slate-950 font-['Outfit']">{formScore}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Top HUD: Workout Category Preview Card */}
          <div className="absolute top-6 right-20 hidden sm:flex items-center gap-3 glass-panel rounded-2xl p-2.5 shadow-xl border border-white/80 z-20">
            <span className="px-2.5 py-1 rounded-full bg-[#FEF08A] text-slate-950 text-[10px] font-extrabold uppercase">
              Stretch & Strength
            </span>
            <div className="text-xs font-bold text-slate-900 max-w-[120px] truncate">{exerciseName}</div>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>

          {/* Right Bottom HUD: Live Feedback Testimonial Card */}
          <div className="absolute bottom-20 right-6 max-w-xs glass-panel rounded-3xl p-4 shadow-xl border border-white/80 z-20 hidden md:block">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-950">AI Posture Coach</div>
                <div className="flex text-amber-400 text-[10px]">
                  {'★★★★★'}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-700 font-semibold mt-2.5 leading-snug">
              {feedback}
            </p>
          </div>

          {/* Bottom Center Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            <div className="glass-panel rounded-full px-5 py-2.5 shadow-xl border border-white flex items-center gap-4 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{formatTime(timer)}</span>
              </div>
              <div className="w-[1px] h-4 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>{calories.toFixed(1)} kcal</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-xl transition-all"
            >
              {isCompleted ? 'Finish Workout' : 'End Session'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
