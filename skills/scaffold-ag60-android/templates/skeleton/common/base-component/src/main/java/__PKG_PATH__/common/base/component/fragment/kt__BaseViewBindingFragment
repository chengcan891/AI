package com.sino.common.base.component.fragment

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.OnBackPressedCallback
import androidx.annotation.StringRes
import androidx.fragment.app.Fragment
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.viewbinding.ViewBinding
import com.sino.common.base.component.AppComponentConfig
import com.sino.common.base.component.interceptor.PageInterceptorRegistry

/**
 * @author ZhangHongYu
 * @date 2025/6/18
 */
abstract class BaseViewBindingFragment<VB : ViewBinding>(private val bindInflater: (LayoutInflater, ViewGroup?, Boolean) -> VB) : Fragment() {

    protected lateinit var binding: VB
        private set


    private val timeProfiler = FragmentTimeProfiler(this)
    private var supportBackEvent = false

    @StringRes
    open var titleRes: Int? = null

    /**
     * 支持parent 接受点击事件
     */
    protected open var supportContainerReceiveClickEvent = false

    var isInitialized = false

    private var isPageVisible: Boolean = false

    init {
        supportBackEvent = isSupportBackEvent()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        timeProfiler.recordStage(FragmentTimeProfiler.Stage.CREATED)
        preLoadData()
    }

    override fun onGetLayoutInflater(savedInstanceState: Bundle?): LayoutInflater {
        val inflater = super.onGetLayoutInflater(savedInstanceState)
        val localizedContext = AppComponentConfig.attachLanguageBaseContext(inflater.context)
        val localizedInflater = if (localizedContext === inflater.context) {
            inflater
        } else {
            inflater.cloneInContext(localizedContext)
        }
        timeProfiler.recordStage(FragmentTimeProfiler.Stage.LAYOUT_INFLATER_READY)
        return localizedInflater
    }

    private val lifecycleObserver = object : DefaultLifecycleObserver {
        override fun onStart(owner: LifecycleOwner) {
            super.onStart(owner)
            timeProfiler.recordStage(FragmentTimeProfiler.Stage.VIEW_LIFECYCLE_STARTED)
        }

        override fun onResume(owner: LifecycleOwner) {
            super.onResume(owner)
            timeProfiler.recordStage(FragmentTimeProfiler.Stage.VIEW_LIFECYCLE_RESUMED)
            dispatchPageVisibleChangedEvent()
        }

        override fun onPause(owner: LifecycleOwner) {
            super.onPause(owner)
            dispatchPageVisibleChangedEvent()
        }

        override fun onDestroy(owner: LifecycleOwner) {
            super.onDestroy(owner)
            timeProfiler.cancelFirstVisibleObservation()
        }
    }

    private val backPressedCallback = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() {
            if (!onBackEvent()) {
                isEnabled = false
                requireActivity().onBackPressedDispatcher.onBackPressed()
            }
            isEnabled = true
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        timeProfiler.recordStage(FragmentTimeProfiler.Stage.CREATE_VIEW_STARTED)
        binding = bindInflater.invoke(inflater, container, false)
        timeProfiler.recordStage(FragmentTimeProfiler.Stage.BINDING_INFLATED)

        if (!supportContainerReceiveClickEvent) {
            binding.root.setOnClickListener {}
        }


        if (supportBackEvent) {
            requireActivity().onBackPressedDispatcher.addCallback(
                viewLifecycleOwner, backPressedCallback
            )
        }

        isInitialized = true
        timeProfiler.recordStage(FragmentTimeProfiler.Stage.CREATE_VIEW_FINISHED)

        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        timeProfiler.recordStage(FragmentTimeProfiler.Stage.VIEW_CREATED_STARTED)
        super.onViewCreated(view, savedInstanceState)
        timeProfiler.recordStage(FragmentTimeProfiler.Stage.VIEW_CREATED_SUPER_FINISHED)
        initPageInterceptor()
        initLauncher()
        initView()
        initData()

        viewLifecycleOwner.lifecycle.addObserver(lifecycleObserver)
        timeProfiler.recordStage(FragmentTimeProfiler.Stage.VIEW_CREATED_FINISHED)
    }

    private fun initPageInterceptor() {
        if (!PageInterceptorRegistry.supportConnectionStateInterceptor) {
            return
        }
        javaClass.annotations.forEach { ann ->
            PageInterceptorRegistry.get(ann.annotationClass)?.init(this, ann)
        }
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        timeProfiler.recordStage(FragmentTimeProfiler.Stage.ATTACHED)
        if (supportBackEvent) {
            backPressedCallback.isEnabled = true
        }
    }

    override fun onDetach() {
        super.onDetach()
        if (supportBackEvent) {
            backPressedCallback.isEnabled = false
        }
    }

    open fun onBackEvent(): Boolean {
        return false
    }

    open fun initLauncher() {}
    abstract fun initView()
    abstract fun initData()

    open fun onLanguageChanged() {}
    open fun onThemeChanged() {}

    /**
     * 在 Fragment 创建且 View 尚未创建时启动数据预加载。
     *
     * 仅用于触发不依赖 [binding]、[viewLifecycleOwner] 的异步任务；任务应由 ViewModel 管理，
     * 不要在此执行主线程耗时操作。UI 数据观察与渲染仍应放在 [initData] 中。
     * 每个 Fragment 实例仅调用一次，View 重建时不会重复调用。
     */
    open fun preLoadData() {}

    private fun dispatchPageVisibleChangedEvent() {
        val isVisible = isAdded && !isHidden && viewLifecycleOwner.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)

        if (isPageVisible == isVisible) return

        isPageVisible = isVisible
        if (isPageVisible) {
            val currentView = view
            if (currentView != null) {
                timeProfiler.observeFirstVisible(currentView)
            }
        } else {
            timeProfiler.cancelFirstVisibleObservation()
        }
        onPageVisibleChanged(isPageVisible)
    }

    open fun onPageVisibleChanged(visible: Boolean) {}

    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        dispatchPageVisibleChangedEvent()
        childFragmentManager.fragments.forEach {
            it.onHiddenChanged(hidden)
        }
    }

    private fun isSupportBackEvent(): Boolean {
        val clazz = this::class.java
        return try {
            val method = clazz.getDeclaredMethod("onBackEvent")
            method.declaringClass != BaseViewBindingFragment::class.java
        } catch (_: NoSuchMethodException) {
            false
        }
    }

}