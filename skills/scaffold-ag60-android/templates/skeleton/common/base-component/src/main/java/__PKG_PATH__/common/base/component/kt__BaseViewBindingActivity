package com.sino.common.base.component

import android.content.Context
import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import androidx.activity.OnBackPressedCallback
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.fragment.app.FragmentActivity
import androidx.viewbinding.ViewBinding
import com.sino.common.base.component.interceptor.PageInterceptorRegistry
import java.util.Locale

abstract class BaseViewBindingActivity<VB : ViewBinding>(private val bindingInflater: (LayoutInflater) -> VB) : FragmentActivity() {

    protected lateinit var binding: VB
        private set

    protected open var showSystemBar = false

    protected open var isSupportKeyboardAvoidance = true

    private var pageKeyboardAvoidance: PageKeyboardAvoidance? = null

    private var appliedTheme: Int? = null

    private var appliedLocale: Locale? = null

    private val backPressedCallback = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() {
            if (!onBackEvent()) {
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
            }
            isEnabled = true
        }
    }

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(AppComponentConfig.attachLanguageBaseContext(newBase))
    }

    override fun onResume() {
        super.onResume()
        dispatchThemeChangedIfNeeded()
        dispatchLanguageChangedIfNeeded()
        updateSystemBarVisibility()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            updateSystemBarVisibility()
        }
    }

    private fun updateSystemBarVisibility() {
        if (!showSystemBar) {
            Utils.hideSystemBar(window)
        } else {
            Utils.showSystemBar(window)
        }
    }

    private fun observeSystemBarVisibility() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { rootView, windowInsets ->
            val systemBarVisible =
                windowInsets.isVisible(WindowInsetsCompat.Type.statusBars()) ||
                    windowInsets.isVisible(WindowInsetsCompat.Type.navigationBars())
            if (!showSystemBar && systemBarVisible) {
                // Insets 可能在转场、输入法或弹窗焦点切换后再次显示，下一帧重新应用沉浸式状态。
                rootView.postOnAnimation {
                    if (rootView.hasWindowFocus()) {
                        updateSystemBarVisibility()
                    }
                }
            }
            windowInsets
        }
        ViewCompat.requestApplyInsets(binding.root)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        AppComponentConfig.appTheme?.let {
            setTheme(it)
            appliedTheme = it
        }
        appliedLocale = AppComponentConfig.currentLanguage()

        super.onCreate(savedInstanceState)
        updateSystemBarVisibility()

        if (isSupportBackEvent()) {
            onBackPressedDispatcher.addCallback(this, backPressedCallback)
            backPressedCallback.isEnabled = true
        }

        val localizedInflater = layoutInflater.cloneInContext(AppComponentConfig.attachLanguageBaseContext(this))
        AppComponentConfig.applyLanguageToApplication()
        binding = bindingInflater.invoke(localizedInflater)
        setContentView(binding.root)
        observeSystemBarVisibility()

        initFocus()
        initKeyboardAvoidance()
        initPageInterceptor()
        initLauncher()
        initView()
        initData()


    }

    override fun onDestroy() {
        releaseKeyboardAvoidance()
        super.onDestroy()
        releasePageInterceptor()
    }

    fun dispatchThemeChangedIfNeeded() {
        if (AppComponentConfig.isThemeChanged(appliedTheme)) {
            appliedTheme = AppComponentConfig.appTheme
            onThemeChanged()
        }
    }

    fun dispatchLanguageChangedIfNeeded() {
        if (AppComponentConfig.isLanguageChanged(appliedLocale)) {
            appliedLocale = AppComponentConfig.currentLanguage()
            onLanguageChanged()
        }
    }

    open fun onThemeChanged() {
        recreate()
    }

    open fun onLanguageChanged() {
        recreate()
    }

    /**
     * 初始化焦点, 确保根布局可获得焦点,避免在外置点击时,根布局失去焦点
     */
    private fun initFocus() {
        binding.root.isFocusable = true
        binding.root.isFocusableInTouchMode = true
        binding.root.requestFocus()
    }

    private fun initPageInterceptor() {
        if (!PageInterceptorRegistry.supportConnectionStateInterceptor) {
            return
        }
        javaClass.annotations.forEach { ann ->
            PageInterceptorRegistry.get(ann.annotationClass)?.init(this, ann)
        }
    }

    private fun releasePageInterceptor() {
        if (!PageInterceptorRegistry.supportConnectionStateInterceptor) {
            return
        }
        javaClass.annotations.forEach { ann ->
            PageInterceptorRegistry.get(ann.annotationClass)?.release(this, ann)
        }
    }

    open fun onBackEvent(): Boolean {
        return false
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        val result = AppComponentConfig.mAppKeyEventListener?.invoke(this, keyCode, event)
        if (result == true) {
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {
        val result = AppComponentConfig.mAppKeyEventListener?.invoke(this, keyCode, event)
        if (result == true) {
            return true
        }
        return super.onKeyUp(keyCode, event)
    }


    private fun initKeyboardAvoidance() {
        if (!isSupportKeyboardAvoidance) {
            return
        }
        pageKeyboardAvoidance = PageKeyboardAvoidance(this, binding.root).apply {
            attach()
        }
    }

    private fun releaseKeyboardAvoidance() {
        pageKeyboardAvoidance?.release()
        pageKeyboardAvoidance = null
    }

    abstract fun initView()
    abstract fun initData()
    open fun initLauncher() {}

    private fun isSupportBackEvent(): Boolean {
        val clazz = this::class.java
        return try {
            val method = clazz.getDeclaredMethod("onBackEvent")
            method.declaringClass != BaseViewBindingActivity::class.java
        } catch (e: NoSuchMethodException) {
            false
        }
    }

    override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
        if (ev.action == MotionEvent.ACTION_DOWN) {
            val v = currentFocus
            if (isShouldHideInput(v, ev)) {
                val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                imm.hideSoftInputFromWindow(v?.windowToken, 0)
                v?.clearFocus()
            }
        }
        return super.dispatchTouchEvent(ev)
    }

    /**
     * 判断是否需要隐藏键盘：如果点击的点不在 EditText 范围内，则隐藏
     */
    private fun isShouldHideInput(v: View?, event: MotionEvent): Boolean {
        if (v != null && v is EditText) {
            val leftTop = intArrayOf(0, 0)
            v.getLocationInWindow(leftTop)
            val left = leftTop[0]
            val top = leftTop[1]
            val bottom = top + v.height
            val right = left + v.width

            return !(event.x > left && event.x < right && event.y > top && event.y < bottom)
        }
        return false
    }

}
