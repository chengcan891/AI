package com.sino.common.base.component

import android.app.Dialog
import android.content.DialogInterface
import android.graphics.Color
import android.graphics.Rect
import android.graphics.drawable.ColorDrawable
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.cardview.widget.CardView
import androidx.fragment.app.DialogFragment
import androidx.viewbinding.ViewBinding

/**
 * @author ZhangHongYu
 * @date 2025/6/18
 */
abstract class BaseVBCardDialogFragment<VB : ViewBinding>(private val bindInflater: (LayoutInflater) -> VB) : DialogFragment() {

    protected lateinit var binding: VB
        private set

    var isInitialized: Boolean = false

    private var immersiveDecorView: View? = null
    private val immersiveWindowFocusChangeListener =
        ViewTreeObserver.OnWindowFocusChangeListener { hasFocus ->
            if (hasFocus && isFullScreen) {
                dialog?.window?.let(::applyImmersiveMode)
                activity?.window?.let(::applyImmersiveMode)
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        isCancelable = canCancel
        if (isFullScreen) {
            setStyle(STYLE_NO_FRAME, R.style.BaseFullScreenDialog)
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        binding = bindInflater.invoke(layoutInflater)
        isInitialized = true
        return binding.root
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return super.onCreateDialog(savedInstanceState).apply {
            setCancelable(canCancel)
            setCanceledOnTouchOutside(cancelOutside)
            if (isFullScreen) {
                // onCreateDialog 阶段 DecorView 尚未创建，仅预设窗口参数，沉浸模式在窗口显示后执行
                window?.let { prepareFullScreenWindow(it, applyImmersiveModeNow = false) }
                setOnShowListener {
                    window?.let(::prepareFullScreenWindow)
                    activity?.window?.let(::applyImmersiveMode)
                }
            }
        }
    }

    override fun onStart() {
        super.onStart()
        dialog?.apply {
            window?.apply {
                if (isFullScreen) {
                    prepareFullScreenWindow(this)
                    activity?.window?.let(::applyImmersiveMode)
                }

                setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
                setGravity(Gravity.CENTER)
                setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)

                if (isFullScreen) {
                    applyImmersiveMode(this)
                    observeImmersiveWindowFocus(this)
                    decorView.setOnSystemUiVisibilityChangeListener { visibility ->
                        if (visibility and View.SYSTEM_UI_FLAG_FULLSCREEN == 0) {
                            decorView.post {
                                applyImmersiveMode(this)
                            }
                        }
                    }
                }
            }

            setCancelable(canCancel)
            setCanceledOnTouchOutside(cancelOutside)
        }
    }

    override fun onResume() {
        super.onResume()
        if (isFullScreen) {
            dialog?.window?.let { window ->
                window.decorView.post {
                    window.clearFlags(WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE)
                    applyImmersiveMode(window)
                    activity?.window?.let(::applyImmersiveMode)
                }
            }
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        if (canCancel) {
            (activity as? ComponentActivity)?.onBackPressedDispatcher?.addCallback(
                viewLifecycleOwner,
                object : OnBackPressedCallback(true) {
                    override fun handleOnBackPressed() {
                        dismiss()
                    }
                }
            )
        }
        setupRootTouchHandling(view)

        super.onViewCreated(view, savedInstanceState)
        initView()
        initData()
    }

    private fun prepareFullScreenWindow(
        window: android.view.Window,
        applyImmersiveModeNow: Boolean = true
    ) {
        window.setFlags(
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
        )
        window.addFlags(
            WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        )
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT
        window.attributes = window.attributes.apply {
            layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.isNavigationBarContrastEnforced = false
            window.isStatusBarContrastEnforced = false
        }
        if (applyImmersiveModeNow) {
            applyImmersiveMode(window)
        }
    }

    private fun applyImmersiveMode(window: android.view.Window) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let {
                it.hide(WindowInsets.Type.systemBars())
                it.systemBarsBehavior =
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_FULLSCREEN)
        }
    }

    private var dismissListener: (() -> Unit)? = null

    fun setDismissListener(listener: (() -> Unit)) {
        dismissListener = listener
    }

    override fun onDismiss(dialog: DialogInterface) {
        super.onDismiss(dialog)
        dismissListener?.invoke()
        keepHostActivityImmersive()
    }

    override fun onDestroyView() {
        removeImmersiveWindowFocusListener()
        super.onDestroyView()
        keepHostActivityImmersive()
    }

    private fun observeImmersiveWindowFocus(window: android.view.Window) {
        removeImmersiveWindowFocusListener()
        immersiveDecorView = window.decorView
        window.decorView.viewTreeObserver.addOnWindowFocusChangeListener(
            immersiveWindowFocusChangeListener
        )
    }

    private fun removeImmersiveWindowFocusListener() {
        immersiveDecorView?.viewTreeObserver?.let { observer ->
            if (observer.isAlive) {
                observer.removeOnWindowFocusChangeListener(immersiveWindowFocusChangeListener)
            }
        }
        immersiveDecorView = null
    }

    private fun keepHostActivityImmersive() {
        val activityWindow = activity?.window ?: return
        // post 保证在 Dialog 窗口焦点释放、Activity 窗口重新获焦之后再执行
        activityWindow.decorView.post {
            applyImmersiveMode(activityWindow)
        }
    }

    /**
     * 全屏 Dialog 根布局铺满窗口时，系统 [Dialog.setCanceledOnTouchOutside] 无法识别遮罩区域点击；
     * 在根布局上判断触点是否在卡片内容外，在外则关闭弹窗。
     */
    private fun setupRootTouchHandling(rootView: View) {
        rootView.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_DOWN) {
                if (cancelOutside && canCancel && shouldDismissOnTouchOutside(rootView, event)) {
                    dismiss()
                    return@setOnTouchListener true
                }
                hideKeyboardWhenTouchOutsideInput(event)
            }
            false
        }
    }

    private fun shouldDismissOnTouchOutside(rootView: View, event: MotionEvent): Boolean {
        val contentViews = findCardContentViews(rootView)
        if (contentViews.isEmpty()) {
            return false
        }
        val rawX = event.rawX.toInt()
        val rawY = event.rawY.toInt()
        return contentViews.none { view ->
            val rect = Rect()
            view.getGlobalVisibleRect(rect) && rect.contains(rawX, rawY)
        }
    }

    private fun findCardContentViews(root: View): List<View> {
        if (root is CardView) {
            return listOf(root)
        }
        if (root !is ViewGroup) {
            return emptyList()
        }
        val result = mutableListOf<View>()
        for (i in 0 until root.childCount) {
            result.addAll(findCardContentViews(root.getChildAt(i)))
        }
        return result
    }

    private fun hideKeyboardWhenTouchOutsideInput(event: MotionEvent) {
        val focusView = dialog?.currentFocus ?: activity?.currentFocus
        if (focusView !is EditText) return

        val focusRect = Rect()
        focusView.getGlobalVisibleRect(focusRect)
        if (focusRect.contains(event.rawX.toInt(), event.rawY.toInt())) return

        focusView.clearFocus()
        val imm = context?.getSystemService(InputMethodManager::class.java) ?: return
        imm.hideSoftInputFromWindow(focusView.windowToken, 0)
    }

    abstract fun initData()
    abstract fun initView()

    protected open fun onDialogDismiss() {}

    protected open val canCancel: Boolean = true
    protected open val cancelOutside: Boolean = true

    protected open val isFullScreen: Boolean = true
}